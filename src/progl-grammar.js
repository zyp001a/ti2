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
			["\\/\\*[\\S\\s]*\\*\\/", "return;"],//COMMENT
			["\\#[^\\n\\r]+[\\n\\r]*", "return;"],//COMMENT
			["\\\/\\\/[^\\n\\r]+[\\n\\r]*", "return;"],//COMMENT
			["`(\\\\.|[^\\\\`])*`", 
			 "yytext = yytext.substr(1, yyleng-2).replace(/\\\\`/g, '`'); return 'Tpl';"],
			["\'(\\\\.|[^\\\\\'])*\'|\"(\\\\.|[^\\\\\"])*\"",
			 "yytext = yytext.substr(1, yyleng-2).replace(/\\\\u([0-9a-fA-F]{4})/, function(m, n){ return String.fromCharCode(parseInt(n, 16)) }).replace(/\\\\(.)/g, function(m, n){ if(n == 'n') return '\\n';if(n == 'r') return '\\r';if(n == 't') return '\\t';return n;}); return 'String';"], 
			["\<[a-zA-Z0-9_\\\/\\s]*\>",
       "yytext = yytext.replace(/^\<\\s*/, '').replace(/\\s*\>$/, ''); return 'Relstr';"],
      ["\\\\[\\r\\n;]+", "return"],//allow \ at end of line
			["\\b\\_\\b", "return 'Undefined'"],			
			["{letter}({letter}|{digit}|\\$)*", "return 'Id'"],
			["\\$({letter}|{digit}|\\$)*",
			 "yytext = yytext.substr(1);return 'Reg'"],
//TODO bignumber			
      ["\\b{int}\\b", "return 'Int';"],			
      ["\\b{int}{frac}{exp}?\\b", "return 'Number';"],
      ["\\b0[xX][a-zA-Z0-9]+\\b", "return 'Int';"],
      ["\\.", "return '.'"],
			["\\=\\>", "return '=>'"],			
      ["\\(", "return '('"],
      ["\\)", "return ')'"],
      ["\\[", "return '['"],
      ["\\]", "return ']'"],
      ["\\{", "return '{'"],
      ["\\}", "return '}'"],
			["\\=\\?", "return '=?'"],
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
			["\\s","return"]
    ]
  },
	"operators": [
		["right", "~"],
		["right", "=>"],
		["left", ","],
    ["right", "?", ":"],				
    ["right", "=", "+=", "-=", "*=", "/="],
    ["left", "||"],		
    ["left", "&&"],		
		["left", "==", "!="],
		["left", "<", "<=", ">", ">="],		
    ["left", "+", "-"],		
    ["left", "*", "/", "%"],
    ["right", "&", "@"],		
    ["right", "!"],			
		["left", "(", ")", "[", "]", "{", "}"],		 
	],
  "start": "Start",
//	"parseParams": ["m"],
  "bnf": {
		"Start": [
			["Raw", "return $$ = $1"],
			["Raw ,", "return $$ = $1"],
		],
		"Raw": [			
			["Number", "$$ = ['obj', 'Number', Number($1)]"],
			["Int", "$$ = ['obj', 'Int', Number($1)]"],
			["String", "$$ = ['obj', 'String', $1]"],
			["Undefined", "$$ = ['obj', 'Undefined']"],
			
			["Tpl", "$$ = ['tpl', $1]"],
			
			["Addr", "$$ = $1"],
			
			["Block", "$$ = ['block', $1]"],
			["@ Function", "$$ = ['native', ['function', $2, []]]"],			
			["Function", "$$ = ['function', $1, []]"],
			["Rels Function", "$$ = ['function', $2, $1]"],			
			["Rels Array", "$$ = ['arr', $2, $1]"],
			["Array", "$$ = ['arr', $1, []]"],
			["Rels", "$$ = ['dic', $1]"],
			["Call", "$$ = ['call', $1]"],
			["Addrget", "$$ = ['call', [['id', 'addrget'], $1]]"],			
			["Assign", "if($1[1][0] == 'call' && $1[1][1][0][1] == 'addrget'){ $$ = ['call', [ ['id', 'addrset'], [$1[1][1][1][0], $1[1][1][1][1], $1[0]] ]]} else {$$ = ['call', [ ['id', 'assign'], $1 ]]}"],//$1 = [right, ['call', ]
			
			["~ Raw", "$$ = ['call', [ ['id', 'return'], [$2] ]]"],
			
			["( Raw )", "$$ = $2"],
		],
		Addr: [
			["Id", "$$ = ['id', $1]"],
			["Reg", "$$ = ['reg', $1]"],
			["@ Id", "$$ = ['global', $2]"],
			["@ String", "$$ = ['global', $2]"],
		],
		Rels: [
			["Relstr", "$$ = $1.split(/\\s+/)"]
		],
		"Addrget": [
			["Addr . Id", "$$ = [$1, ['obj', 'String', $3]]"],
			["Addr [ Raw ]", "$$ = [$1, $3]"],
			["String [ Raw ]", "$$ = [['obj', 'String', $1], $3]"],
			["Addrget . Id", "$$ = [['call', [['id', 'addrget'], $1]], ['obj', 'String', $3]]"],
			["Addrget [ Raw ]", "$$ = [['call', [['id', 'addrget'], $1]], $3]"],
			["( Raw ) . Id", "$$ = [$2, ['obj', 'String', $5]]"],			
			["( Raw ) [ Raw ]", "$$ = [$2, $5]"],
		],
		"Block": [
			["{ }", "$$= []"],
			["{ Raws }", "$$ = $2"],
		],
		"Raws": [
      [",", "$$ = [];"],			
      ["Raw", "$$ = [$1];"],
      [", Raw", "$$ = [$2];"],			
      ["Raws , Raw", "$$ = $1; $1.push($3);"],
			["Raws ,", "$$ = $1"],			//allow additional ,;
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
			["=> Block", "$$ = [['block', $2]]"],//block in out
			["=> Argdef Raw", "$$ = [$3, $2]"],
//			["=> Id Argdef Block", "$$ = [$4, $3, $2]"]
		],
		"Argdef": [
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
			["CallRaw", "$$ = $1"],
			["Op", "$$ = $1"]
		],
		"CallRaw": [
			["Addr ( )", "$$ = [$1, []];"],
			["Addr ( Raws )", "$$ = [$1, $3];"],
			["CallRaw ( )", "$$ = [['call', $1]];"],
			["CallRaw ( Raws )", "$$ = [['call', $1], $3];"],
		],
		
		"Class": [
			["Id => Rels Block", "$$= [$4, $3, $1]"]
		],		
		"New": [
			["Id { }", "$$ = [$1, []];"],
			["Id { Raws }", "$$ = [$1, $3];"],
		],
		
		"Assign": [
			["Raw = Raw", "$$ = [$3, $1]"],
			["Raw += Raw", "$$ = [['call', [ ['id', 'plus'], [$1, $3] ] ], $1]"]
		],
		"Op": [
			["! Raw", "$$ = [['id', 'not'], [$2]]"],
			["Raw ? Raw : Raw", "$$ = [['id', 'if'], [$1, $3, $5]]"],
			["Raw ? Raw : ", "$$ = [['id', 'if'], [$1, $3]]"],			
			["Raw ? Raw , : Raw", "$$ = [['id', 'if'], [$1, $3, $6]]"],
			["Raw + Raw", "$$ = [['id', 'plus'], [$1, $3]]"],
			["Raw - Raw", "$$ = [['id', 'minus'], [$1, $3]]"],
			["Raw * Raw", "$$ = [['id', 'times'], [$1, $3]]"],
			["Raw / Raw", "$$ = [['id', 'obelus'], [$1, $3]]"],
			["Raw >= Raw", "$$ = [['id', 'ge'], [$1, $3]]"],
			["Raw <= Raw", "$$ = [['id', 'le'], [$1, $3]]"],
			["Raw == Raw", "$$ = [['id', 'eq'], [$1, $3]]"],
			["Raw != Raw", "$$ = [['id', 'ne'], [$1, $3]]"],
			["Raw > Raw", "$$ = [['id', 'gt'], [$1, $3]]"],
			["Raw < Raw", "$$ = [['id', 'lt'], [$1, $3]]"],
			["Raw && Raw", "$$ = [['id', 'and'], [$1, $3]]"],
			["Raw || Raw", "$$ = [['id', 'or'], [$1, $3]]"],
		],
		"Array": [
			["[ ]", "$$ = []"],
			["[ Raws ]", "$$ = $2"]
		]
  }
};
var options = {};
var code = new jison.Generator(grammar, options).generate();
fs.writeFileSync(__dirname + '/progl-parser.js', code);

