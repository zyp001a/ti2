var jison = require("jison");
var fs = require("fs");
var grammar = {
  "lex": {
    "macros": {
      "digit": "[0-9]",
			"letter": "[a-zA-Z_]",
      "esc": "\\\\",
      "int": "-?(?:[0-9]|[1-9][0-9]+)",
      "exp": "(?:[eE][-+]?[0-9]+)",
      "frac": "(?:\\.[0-9]+)",
      "br": "[\\n\\r;,]+"			
    },
    "rules": [
			["\\/\\*[\\S\\s]*\\*\\/", "return;"],//COMMENT
			["\\#[^\\n\\r]+[\\n\\r]*", "return;"],//COMMENT
			["\\\/\\\/[^\\n\\r]+[\\n\\r]*", "return;"],//COMMENT
			["\`(\\.|[^\\\`])*\`", 
			 "yytext = yytext.substr(1, yyleng-2); return 'Native';"],
			["\"(\\.|[^\\\"])*\"",
			 "yytext = yytext.substr(1, yyleng-2); return 'String';"],
			["\'(\\.|[^\\\'])*\'",
			 "yytext = yytext.substr(1, yyleng-2); return 'String';"],
			["\<(?:{letter}|{digit}|\\s)*>",
       "yytext = yytext.replace(/^\<\\s*/, '').replace(/\\s*\>$/, ''); return 'Relstr';"],
      ["\\\\[\\r\\n;]+", "return"],//allow \ at end of line
			["{letter}({letter}|{digit})*", "return 'Id'"],
			["\\${letter}({letter}|{digit})*",
			 "yytext = yytext.substr(1);return 'Reg'"],
			["\\${digit}*", 
			 "yytext = yytext.substr(1);return 'Reg'"],
      ["{int}{frac}?{exp}?\\b", "return 'Number';"],
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
			["{br}", "return ','"],
//      [",", "return ','"],
//      [";", "return ','"],
			["\\_", "return 'Undefined'"],
			["\\s","return"]
    ]
  },
	"operators": [
    ["right", "~"],			
		["right", "=>"],		
		["left", "(", ")"],
		["left", "{", "}"],		
    ["right", "=", "+=", "-=", "*=", "/="],
		["left", "<", ">", ">=", "<=", "==", "!="],
		["left", "=~"],
    ["left", "||"],
    ["left", "&&"],
    ["left", "+", "-"],
    ["left", "*", "/", "%"],
    ["right", "&", "|", "@"],
    ["right", "!"],
		["left", ".", ":"]
		["left", ","]
	],
  "start": "Start",
//	"parseParams": ["m"],
  "bnf": {
		"Start": [
			["Raw", "return $$ = $1"]
		],
		"Raw": [
			["Number", "$$ = ['obj', 'Number', Number($1)]"],
			["String", "$$ = ['obj', 'String', $1]"],
			["Undefined", "$$ = ['obj', 'Undefined']"],
			["Native", "$$ = ['native', $1]"],
			["@ Native", "$$ = ['tpl', $2]"],			
			["Id", "$$ = ['id', $1]"],
			["Reg", "$$ = ['reg', $1]"],
			["@ Id", "$$ = ['global', $2]"],
			["@ String", "$$ = ['global', $2]"],			
			["Addr", "$$ = ['addr', $1]"],
			["Block", "$$ = ['block', $1]"],
			["Function", "$$ = ['function', $1]"],
			["Class", "$$ = ['class', $1]"],			
			["Hash", "$$ = ['hash', $1]"],
			["Rels Hash", "$$ = ['cpt', $2, $1]"],
			["Rels", "$$ = ['brch', $1]"],			
			["Call", "$$ = ['call', $1]"],
			["Assign", "$$ = ['assign', $1]"],
			["New", "$$ = ['new', $1]"],
			["~ Raw", "$$ = ['return', $2]"],			
			["( Raw )", "$$ = $2"]
		],
		Rels: [
			["Relstr", "$$ = $1.split(/\\s+/)"]
		],
		"Addr": [
			["Id . KeyCall", "$$ = [['id', $1], $3]"],
			["String . KeyCall", "$$ = [['obj', 'String', $1], $3]"],
			["Addr . KeyCall", "$$ = [['addr', $1], $3]"],
			["( Raw ) . KeyCall", "$$ = [$2, $5]"],				
		],
		"KeyCall": [
			["Id", "$$ = ['obj', 'String', $1]"],
			["String", "$$ = ['obj', 'String', $1]"],
			["Number", "$$ = ['obj', 'String', $1]"],		
			["( Call )", "$$ = ['call', $2]"]
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
			["Number :", "$$ = $1"]
		],
		"Function": [
			["FunctionBody", "$$= $1;"],
			["Id FunctionBody", "$$= $2; $$[3] = $1"]
		],
		"FunctionBody": [
			["=> Block", "$$ = [$2, []]"],//block in out
			["=> Argdef Block", "$$ = [$3, $2]"],
			["=> Id Argdef Block", "$$ = [$4, $3, $2]"]
		],
		"Argdef": [
			["( )", "$$= []"],
			["( Subdefs )", "$$= $2"],
			["Subdef", "$$=[$1]"]
		],
    "Subdefs": [
      ["Subdef", "$$ = [$1]; "],
			["Subdefs , Subdef", "$$ = $1; $1.push($3)"]
    ],
		"Subdef": [
			["Id", "$$ = [$1]"],
			["KeyColon Id", "$$ = [$1, $2]"],
		],
		"Call": [
			["CallRaw", "$$ = $1"],
			["Op", "$$ = $1"]
		],
		"CallRaw": [
			["Raw ( )", "$$ = [$1, []];"],
			["Raw ( Raws )", "$$ = [$1, $3];"]
		],
		
		"Class": [
			["Id => Rels Block", "$$= [$4, $3, $1]"]
		],		
		"New": [
			["Id { }", "$$ = [$1, []];"],
			["Id { Raws }", "$$ = [$1, $3];"],
		],
		
		"Assign": [
			["Raw = Raw", "$$ = [$1, $3]"],
			["Raw += Raw", "$$ = [$1, ['call', [ ['id', 'plus'], [$1, $3] ] ]]"]
		],
		"Op": [
			["! Raw", "$$ = [['id', 'not'], [$2]]"],
			["Raw + Raw", "$$ = [['id', 'plus'], [$1, $3]]"],
			["Raw - Raw", "$$ = [['id', 'minus'], [$1, $3]]"],
			["Raw * Raw", "$$ = [['id', 'times'], [$1, $3]]"],
			["Raw / Raw", "$$ = [['id', 'obelus'], [$1, $3]]"],
			["Raw >= Raw", "$$ = [['id', 'ge'], [$1, $3]]"],
			["Raw <= Raw", "$$ = [['id', 'le'], [$1, $3]]"],
			["Raw == Raw", "$$ = [['id', 'eq'], [$1, $3]]"],
			["Raw != Raw", "$$ = [['id', 'ne'], [$1, $3]]"],
			["Raw > Raw", "$$ = [['id', 'gt'], [$1, $3]]"],
			["Raw < Raw", "$$ = [['id', 'lt'], [$1, $3]]"]
		],
		"Hash": [
			["[ ]", "$$ = []"],
			["[ Raws ]", "$$ = $2"]
		]
  }
};
var options = {};
var code = new jison.Generator(grammar, options).generate();
fs.writeFileSync(__dirname + '/progl-parser.js', code);

