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
      "frac": "(?:\\.[0-9]+)"
    },
    "rules": [
			["\\/\\*[\\S\\s]*\\*\\/", "return;"],//COMMENT
			["\\#[^\\n\\r]+[\\n\\r]*", "return;"],//COMMENT
			["\\\/\\\/[^\\n\\r]+[\\n\\r]*", "return;"],//COMMENT
			["\`(\\.|[^\\\`])*\`", 
			 "yytext = yytext.replace(/^\\s*\`/, '').replace(/\`\\s*$/, ''); return 'Native';"],			
			["\"(\\.|[^\\\"])*\"",
			 "yytext = yytext.replace(/^\\s*\"/, '').replace(/\"\\s*$/, ''); return 'String';"],
			["\'(\\.|[^\\\'])*\'",
       "yytext = yytext.replace(/^\\s*\'/, '').replace(/\'\\s*$/, ''); return 'String';"],
      ["\\\\[\\r\\n;]+", "return"],//allow \ at end of line
			["\\$?{letter}({letter}|{digit}|\/)*", 
			 "yytext = yytext.replace(/\\s/g, '');return 'Id'"],
      ["{int}{frac}?{exp}?\\b",
			 "yytext = yytext.replace(/\\s/g, ''); return 'Number';"],
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
      [",", "return ','"],
      [";", "return ','"],
			["\\_", "return 'Undefined'"],
			["[\\n\\r ]","return"]
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
			["Id", "$$ = ['id', $1]"],
			["@ Id", "$$ = ['local', $2]"],
			["Addr", "$$ = ['addr', $1]"],
			["Block", "$$ = ['block', $1]"],
			["Function", "$$ = ['function', $1]"],
			["Call", "$$ = ['call', $1]"],
			["Cpt", "$$ = ['cpt', $1]"],
			["@ Cpt", "$$ = ['brch', $2]"],			
			["( Raw )", "$$ = $2"]
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
			["{ Elements }", "$$ = $2"]
		],
		"Elements": [
      ["Element", "$$ = []; $1[0] !== undefined?$$[$1[0]] = $1[1]:$$.push($1[1])"],
      ["Elements , Element", "$$ = $1; $3[0] !== undefined?$$[$3[0]] = $3[1]:$$.push($3[1]);"],
			["Elements ,", "$$ = $1"],			//allow additional ,;
		],
		"KeyColon": [
			["Id :", "$$ = $1"],
			["String :", "$$ = $1"],
			["Number :", "$$ = $1"]
		],
		"Element": [
      ["Raw", "$$ = [,$1]"],
      ["KeyColon Raw", "$$ = [$1, $2]"],
		],
		"Function": [
			["=> Block", "$$ = [$2, []]"],//block in out
			["=> Argdef Block", "$$ = [$3, $2]"],
			["=> Id Argdef Block", "$$ = [$4, $3, $2]"]
		],
		"Argdef": [
			["( )", "$$= []"],
			["( Subdefs )", "$$= $2"],
			["Subdef", "$$=[];$$[$1[0]] = $1[1]"]
		],
    "Subdefs": [
      ["Subdef", "$$ = []; $$[$1[0]] = $1[1]"],
			["Subdefs , Subdef", "$$ = $1; $1[$3[0]] = $3[1]"]
    ],
		"Subdef": [
			["Id", "$$ = [$1, []]"],
			["Id : Id", "$$ = [$1, [$3]]"],
			["Id = Raw", "$$ = [$1, [, $3]]"],
			["Id : Id = Raw", "$$ = [$1, [$3, $5]]"]
		],
		"Call": [
			["Raw ( )", "$$ = [$1, []];"],
			["Raw ( Elements )", "$$ = [$1, $3];"],
			["Op", "$$ = $1"]
		],
		"Op": [
			["~ Raw", "$$ = [['id', 'return'], [$2]]"],
			["Raw = Raw", "$$ = [['id', 'assign'], [$3, $1]]"],
			["Raw += Raw", "$$ = [['id', 'assign'], [ ['call', [ ['id', 'plus'], [$1, $3] ] ], $1]]"],
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
		"Cpt": [
			["[ ]", "$$ = [[], []]"],
			["[ Elements ]", "$$ = [$2, []]"],
			["[ ] [ Rels ]", "$$ = [[], $4]"],
			["[ Elements ] [ Rels ]", "$$ = [$2, $5]"]
		],
		"Rels": [
			["Id", "$$ = [$1]"],
			["Rels Id", "$$ = $1; $1.push($2);"]			
		]
  }
};
var options = {};
var code = new jison.Generator(grammar, options).generate();
fs.writeFileSync(__dirname + '/progl-parser.js', code);

