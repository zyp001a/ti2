var jison = require("jison");
var fs = require("fs");
var grammar = {
  "lex": {
    "macros": {
      "digit": "[0-9]",
			"letter": "[a-zA-Z_]",
      "int": "-?(?:[0-9]|[1-9][0-9]+)",
      "esc": "\\\\",			
      "exp": "(?:[eE][-+]?[0-9]+)",
      "frac": "(?:\\.[0-9]+)",
      "br": "[\\n\\r;,]+"			
    },
    "rules": [
			["\\/\\*.*\\*\\/", "return;"],//COMMENT
			["\\\/\\\/[^\\n\\r]+[\\n\\r]*", "return;"],//COMMENT
			["#(\\\\.|[^\\\\#])*#", 
			 "yytext = yytext.substr(1, yyleng-2).replace(/\\\\#/g, '#'); return 'Comment';"],			
			["`(\\\\.|[^\\\\`])*`", 
			 "yytext = yytext.substr(1, yyleng-2).replace(/\\\\`/g, '`'); return 'Tpl';"],
			["\'(\\\\.|[^\\\\\'])*\'|\"(\\\\.|[^\\\\\"])*\"",
			 "yytext = yytext.substr(1, yyleng-2).replace(/\\\\u([0-9a-fA-F]{4})/, function(m, n){ return String.fromCharCode(parseInt(n, 16)) }).replace(/\\\\(.)/g, function(m, n){ if(n == 'n') return '\\n';if(n == 'r') return '\\r';if(n == 't') return '\\t'; return n;}); return 'Stringp';"], 
			["\<[a-zA-Z0-9_\\\/\\s]*\>",
       "yytext = yytext.replace(/^\<\\s*/, '').replace(/\\s*\>$/, ''); return 'Relstr';"],
      ["\\\\[\\r\\n;]+", "return"],//allow \ at end of line
			["\\b\\_\\b", "return 'Undefined'"],			
			["{letter}({letter}|{digit}|\\$)*", "return 'Id'"],
			["\\$({letter}|{digit}|\\$)*",
			 "yytext = yytext.substr(1);return 'Reg'"],
//TODO bignumber			
      ["{int}\\b", "return 'Int';"],
      ["{int}{frac}{exp}?\\b", "return 'Number';"],
      ["0[xX][a-zA-Z0-9]+\\b", "return 'Int';"],
      ["\\.", "return '.'"],
			["\\=\\>", "return '=>'"],
			["\\-\\>", "return '->'"],			      
      ["\\(", "return '('"],
      ["\\)", "return ')'"],
      ["\\[", "return '['"],
      ["\\]", "return ']'"],
      ["\\{", "return '{'"],
      ["\\}", "return '}'"],
			["\\+\\+", "return '++'"],
			["\\-\\-", "return '--'"],			
			["\\?\\?", "return '??'"],
			["\\:\\:", "return '::'"],      
			["\\?\\=", "return '?='"],
			["\\>\\=", "return '>='"],
			["\\<\\=", "return '<='"],
			["\\=\\=", "return '=='"],
			["\\!\\=", "return '!='"],
			["\\+\\=", "return '+='"],
			["\\-\\=", "return '-='"],
			["\\*\\=", "return '*='"],
			["\\/\\=", "return '/='"],
			["\\|\\|", "return '||'"],
			["\\&\\&", "return '&&'"],
      ["\\>", "return '>'"],
      ["\\<", "return '<'"],
      ["\\&", "return '&'"],
      ["\\@", "return '@'"],
			["\\!", "return '!'"],
			["\\~", "return '~'"],			
			["=", "return '='"],
			["\\+", "return '+'"],
			["\\-", "return '-'"],
			["\\*", "return '*'"],
			["\\/", "return '/'"],
			["\\%", "return '%'"],
			["\\^", "return '^'"],
			["\\.", "return '.'"],
			["\\:", "return ':'"],
			["\\?", "return '?'"],			
			["{br}", "return ','"],
//      [",", "return ','"],
//      [";", "return ','"],
			[".","return"]
    ]
  },
	"operators": [
		["right", "~"],
		["right", "=>"],
		["left", ","],
    ["right", "??", "::", "?", ":"],				
    ["right", "=", "+=", "-=", "*=", "/=", "?="],
    ["left", "||"],		
    ["left", "&&"],		
		["left", "==", "!="],
		["left", "<", "<=", ">", ">="],		
    ["left", "+", "-"],		
    ["left", "*", "/", "%"],
    ["left", "++", "--"],		
    ["right", "&", "@", "|"],
    ["right", "!"],
		["left", "(", ")", "[", "]", "{", "}"],		 
	],
  "start": "Start",
//	"parseParams": ["m"],
  "bnf": {
		"Start": [
			["Elem", "return $$ = $1"],
			["Elem ,", "return $$ = $1"],
		],
		"Static":[
			["Number", "$$ = Number($1)"],
			["Int", "$$ = Number($1)"],
			["String", "$$ = $1"],
			["Undefined", "$$ = undefined"],
			["Tpl", "$$ = tpl($1)"],
		],
		"Dynamic": [
			["Function", "$$ = $1"],
			["& Function", "$$ = await async($1)"],						
			["Array", "$$ = await arrDef($1)"],
			["Dic", "$$ = await dicDef($1)"],			
			["Scope", "$$ = await scopeDef($1)"],
		],
		"Mid": [
			["Addr", "$$ = $1"],			
			["Block", "$$ = await block($1)"],
			["Call", "$$ = $1"],
			["& Call", "$$ = await waitcall($2)"],			
			["Op", "$$ = $1"],
			["Get", "$$ = $1"],
			["Assign", "$$ = $1"],
			["Return", "$$ = $1"],			
		],
		"Return": [
			["~ Elem", "$$ = await call(await idf('return'), [$2])"],						
		],
		Addr: [
			["Id", "$$ = await id($1)"],
			["Reg", "$$ = reg($1)"],
		],		
		"Elem": [
			["Static", "$$ = $1"],
			["Dynamic", "$$ = $1"],
			["Rels Dynamic", "$$ = rels($2, $1)"],
			["Rels", "$$ = rels($1)"],			
			["Mid", "$$ = $1"],
			["| Elem |", "$$ = keep($2)"],
			["( Elem )", "$$ = $2"],
		],
    String:[
      ["Stringp", "$$ = $1"],
      ["@ Tpl", "$$ = $2"],
    ],
		Rels: [
			["Relstr", "$$ = $1.split(/\\s+/)"]
		],
		"Get": [
			["Addr . Id", "$$ = scopeGet($1, $3)"],
			["Addr [ Elem ]", "$$ = addrGet($1, $3)"],
			["Get . Id", "$$ = scopeGet($1, $3)"],
			["Get [ Elem ]", "$$ = addrGet($1, $3)"],
			["( Elem ) . Id", "$$ = scopeGet($2, $5)"],
			["( Elem ) [ Elem ]", "$$ = addrGet($2, $5)"],
		],
		"Block": [
			["{ }", "$$= []"],
			["{ Elems }", "$$ = $2"],
		],
		"Elems": [
      [",", "$$ = [];"],			
      ["Elem", "$$ = [$1];"],
      [", Elem", "$$ = [$2];"],			
      ["Elems , Elem", "$$ = $1; $1.push($3);"],
			["Elems ,", "$$ = $1"],			//allow additional ,;
		],
    "NElems": [
      [",", "$$ = {};"],
      ["NElem", "$$ = {};$$[$1[0]] = $1[1]"],
      [", NElem", "$$ = {};$$[$2[0]] = $2[1]"],
      ["NElems , NElem", "$$ = $1; $1[$3[0]] = $3[1]"],
      ["NElems ,", "$$ = $1;"],      
    ],
    "NElem": [
		  ["KeyColon Elem", "$$ = [$1, $2]"]
    ],
		"KeyColon": [
			["Id :", "$$ = $1"],
			["String :", "$$ = $1"],
			["Number :", "$$ = $1"],
			["Int :", "$$ = $1"],	
		],
		"Function": [
			["FunctionBody", "$$= $1;"],
			["Id FunctionBody", "$$= $2; $$[3] = $1"]
		],
		"FunctionBody": [
			["=> Block", "$$ = [await block($2)]"],//block in out
			["=> Funcarg Block", "$$ = [await block($3), await funcarg($2)]"],
		],
		"Funcarg": [
			["( )", "$$= [[]]"],
			["( Subdefs )", "$$= [$2]"],
			["( ~ Type Subdefs )", "$$= [$4, $3]"],
			["( ~ Type )", "$$= [[], $3]"],
//			["Subdef", "$$=[$1]"]
		],
    "Subdefs": [
      ["Subdef", "$$ = [$1]; "],
			["Subdefs , Subdef", "$$ = $1; $1.push($3)"]
    ],
		"Subdef": [
			["Id", "$$ = [$1]"],
			["KeyColon Type", "$$ = [$1, $2]"],
		],
		"Type": [
			["Id", "$$ = $1"],
			["Id Rels", "$$ = $1"],//TODO realtype
		],
		"Call": [
			["Addr ( )", "$$ = await call($1, []);"],
			["Addr ( Elems )", "await call($1, $3);"],
			["Get ( )", "$$ = await call($1, []);"],
			["Get ( Elems )", "$$ = await call($1, $3);"],
			["Call ( )", "$$ = await call($1, []);"],
			["Call ( Elems )", "$$ = await call($1, $3);"],
		],
		"Assign": [
			["Elem = Elem", "$$ = await assign($3, $1)"],
			["Elem -= Elem", "$$ = await assign(await op('minus', [$1, $3]), $1)"],
			["Elem --", "$$ = [['call', [ ['id', 'minus'], [$1,  ['obj', 'Int', 1] ] ] ], $1]"],			
			["Elem *= Elem", "$$ = [['call', [ ['id', 'times'], [$1, $3] ] ], $1]"],
		  ["Elem /= Elem", "$$ = [['call', [ ['id', 'obelus'], [$1, $3] ] ], $1]"],

			["Elem ?= Elem", "$$ = await op('default', [$3, $1])"],      
			["Elem += Elem", "$$ = await op('concat', [$3, $1])"],      
			["Elem ++", "$$ = await op('concat', [1, $1])"], 			
		],
		"Op": [
			["! Elem", "$$ = [['id', 'not'], [$2]]"],
			["Elem ? Elem : Elem", "$$ = [['id', 'if'], [$1, $3, $5]]"],
			["Elem ? Elem , : Elem", "$$ = [['id', 'if'], [$1, $3, $6]]"],      
			["Elem ? Elem : ", "$$ = [['id', 'if'], [$1, $3]]"],			
			["Elem ?? { Swtich }", "$$ = [['id', 'switch'], [$1, $4]]"],
			["Elem + Elem", "$$ = [['id', 'plus'], [$1, $3]]"],
			["Elem - Elem", "$$ = [['id', 'minus'], [$1, $3]]"],
			["Elem * Elem", "$$ = [['id', 'times'], [$1, $3]]"],
			["Elem / Elem", "$$ = [['id', 'obelus'], [$1, $3]]"],
			["Elem >= Elem", "$$ = [['id', 'ge'], [$1, $3]]"],
			["Elem <= Elem", "$$ = [['id', 'le'], [$1, $3]]"],
			["Elem == Elem", "$$ = [['id', 'eq'], [$1, $3]]"],
			["Elem != Elem", "$$ = [['id', 'ne'], [$1, $3]]"],
			["Elem > Elem", "$$ = [['id', 'gt'], [$1, $3]]"],
			["Elem < Elem", "$$ = [['id', 'lt'], [$1, $3]]"],
			["Elem && Elem", "$$ = [['id', 'and'], [$1, $3]]"],
			["Elem || Elem", "$$ = [['id', 'or'], [$1, $3]]"],
		],
		"Array": [
			["[ ]", "$$ = []"],
			["[ Elems ]", "$$ = $2"]
		],
    "Dic": [
      ["@ { }", "$$ = {}"],
      ["@ { NElems }", "$$ = $3"],
      ["@ [ ]", "$$ = {}"],
      ["@ [ NElems ]", "$$ = $3"],			
    ],
    "Class": [
      ["@ [ ]", "$$ = {}"],
      ["@ [ NElems ]", "$$ = $3"],
    ],
  }
};
var options = {};
var code = new jison.Generator(grammar, options).generate();
console.log("var sl = require('./sl')");
console.log("for(var k in sl){global[k] = sl[k]}");
console.log(code.replace(/function ([^P][^\)]*)\(/g, "async function $1("));

