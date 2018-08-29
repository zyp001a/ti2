var jison = require("jison");
var fs = require("fs");
var grammar = {
  "lex": {
    "macros": {
      "int": "-?(?:[0-9]|[1-9][0-9]+)",
      "esc": "\\\\",			
      "exp": "(?:[eE][-+]?[0-9]+)",
      "frac": "(?:\\.[0-9]+)",
      "br": "[\\n\\r;,]+"			
    },
    "rules": [
			["\\/\\*.*\\*\\/", "return;"],//COMMENT
			["\\\/\\\/[^\\n\\r]+[\\n\\r]*", "return;"],//COMMENT
//			["#[^\\n\\r]+[\\n\\r]*", "return;"],			
			["@`(\\\\.|[^\\\\`])*`", 
			 "yytext = yytext.substr(2, yyleng-3).replace(/\\\\([`~\\&])/g, '$1'); return 'TPL';"],
			["@\'(\\\\.|\\.)\'", "yytext = yytext.substr(2, yyleng-3); return 'CHAR'"],
			["\'(\\\\.|[^\\\\\'])*\'|\"(\\\\.|[^\\\\\"])*\"|`(\\\\.|[^\\\\`])*`",
			 "yytext = yytext.substr(1, yyleng-2).replace(/\\\\u([0-9a-fA-F]{4})/, function(m, n){ return String.fromCharCode(parseInt(n, 16)) }).replace(/\\\\(.)/g, function(m, n){ if(n == 'n') return '\\n';if(n == 'r') return '\\r';if(n == 't') return '\\t'; return n;}); return 'STR';"], 
//			["\<[a-zA-Z0-9_\\\/\\s]*\>",
//       "yytext = yytext.replace(/^\<\\s*/, '').replace(/\\s*\>$/, ''); return 'PARENTS';"],
      ["\\\\[\\r\\n;]+", "return"],//allow \ at end of line
			["\\b\\_\\b", "return 'UNDF'"],
			["\\$?[a-zA-Z_][a-zA-Z0-9_]*\\$?", "return 'ID'"],
//			["\\#[0-9]+", "yytext = yytext.substr(1);return 'LOCAL'"],			
//TODO bignumber
      ["\\b{int}{frac}?{exp}?u?[slbf]?\\b", "return 'NUM';"],
      ["0[xX][a-zA-Z0-9]+\\b", "return 'NUM';"],
			["@if", "return 'IF'"],
			["@else", "return 'ELSE'"],
			["@elif", "return 'ELIF'"],						
			["@return", "return 'RETURN'"],
			["@continue", "return 'CONTINUE'"],
			["@break", "return 'BREAK'"],			
			["@goto", "return 'GOTO'"],	
			["@foreach", "return 'FOREACH'"],		
			["@for", "return 'FOR'"],
			["@each", "return 'EACH'"],
			["@while", "return 'WHILE'"],
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
			["\\^\\=", "return '^='"],      
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
			["\\#\\#", "return '##'"],			
      ["\\#", "return '#'"],			
      ["\\>", "return '>'"],
      ["\\<", "return '<'"],
      ["\\&", "return '&'"],
      ["\\@", "return '@'"],
			["\\!", "return '!'"],
			["\\~", "return '~'"],			
			["=", "return '='"],
			["\\+", "return '+'"],
			["\\-", "return '-'"],
			["\\^", "return '^'"],
			["\\*", "return '*'"],
			["\\/", "return '/'"],
			["\\%", "return '%'"],
			["\\:", "return ':'"],
			["\\?", "return '?'"],
			["\\.", "return '.'"],
			["{br}", "return ','"],
			[".", "return"]
    ]
  },
	"operators": [
		["right", "~"],
		["right", "=>"],
		["left", ","],
    ["right", "??", "::", "?", ":"],				
    ["right", "=", "+=", "-=", "*=", "/=", "^=", "?="],
    ["left", "++", "--"],		
    ["left", "||"],
    ["left", "&&"],
		["left", "==", "!="],
		["left", "<", "<=", ">", ">="],		
    ["left", "+", "-", "^"],		
    ["left", "*", "/", "%"],
    ["left", "++", "--"],		
    ["right", "&", "@", "|"],
    ["left", "#", "##"],				
    ["right", "!"],
		["left", "(", ")", "[", "]", "{", "}"],		 
	],
  "start": "Start",
//	"parseParams": ["xp"],
  "bnf": {
		Start: [
			["Expr", "return $$ = $1"],
			["Expr ,", "return $$ = $1"],			
		],
		CallEx: [
			["Call", "$$ = ['dic', [$1]]"],
			["Op", "$$ = ['dic', [$1]]"],
			["Assign", "$$ = ['dic', [$1]]"],
			"Dic"
		],
		Expr: [
			"Undf",
			"Char",
			"Num",
			"Str",
//			
			"Func",			
			"Tpl",
			"Arr",
			"Dic",
			"Obj",
			"Class",
//
			"Id",
			"Call",
			"Get",
			"Op",
			"Assign",
			["( Expr )", "$$ = $2"]			
		],		
		Undf: "$$ = ['undf', undefined]",
		Char: "$$ = ['char', $1]",
		Num: "$$ = ['num', $1]",
		Str: "$$ = ['str', $1]",
		Tpl: "$$ = ['tpl', $1]",
		Func: "$$ = ['func', $1]",
		Arr: [
			["[ ]", "$$ = ['arr', []]"],
			["[ Exprs ]", "$$ = ['arr', $2]"]
		],
    "Dic": [
      ["{ }", "$$ = ['dic', []]"],
      ["{ Elems }", "$$ = ['dic', $2]"],
    ],
		Id: [
			["ID", "$$ = ['id', $1]"],
			
			["# ID", "$$ = ['local', $2]"],//stack
			["# NUM", "$$ = ['local', $2]"],//stack						
			["ID # ID ", "$$ = ['local', $3, ['idf', $1]]"],
			["( SubClass ) # ID", "$$ = ['local', $5, $2]"],
			
			["## ID", "$$ = ['global', $2]"],//heap
			["ID ## ID ", "$$ = ['global', $3, ['idf', $1]]"],
			["( SubClass ) ## ID", "$$ = ['global', $5, $2]"],		
			
		],
		Elem: [
			["Expr", "$$ = [$1]"],
			["Ctrl", "$$ = [$1]"],
			["Natl", "$$ = [$1]"],
		  ["KeyColon Expr", "$$ = [$2, $1]"],
		  ["KeyColon , Expr", "$$ = [$3, $1]"],						
		],
		"Ctrl": [
			["If", "$$ = ['ctrl', 'if', $1]"],
			["WHILE Expr Dic", "$$ = ['ctrl', 'while', [$2, $3]]"],
			["FOR Expr , Expr , Expr Dic", "$$ = ['ctrl', 'for', [$2, $4, $6, $7]]"],
			["FOREACH ID Expr Dic", "$$ = ['ctrl', 'foreach', [$2, $3, $4]]"],
			["EACH ID , ID , Expr Dic", "$$ = ['ctrl', 'foreach', [$2, $4, $6, $7]]"],
			["RETURN Expr", "$$ = ['ctrl', 'return', [$2]]"],
			["BREAK", "$$ = ['ctrl', 'break']"],
			["CONTINUE", "$$ = ['ctrl', 'continue']"],
		],
		"If": [
			["IF Expr Dic", "$$ = [$2, $3]"],
			["If ELIF Expr Dic", "$$ = $1; $1.push($3); $1.push($4)"],
			["If ELSE Dic", "$$ = $1; $1.push($3)"],
		],
		KeyColon: [
			["ID :", "$$ = $1"],
			["STR :", "$$ = $1"],
			["NUM :", "$$ = $1"],
		],
		Elems: [
      [",", "$$ = [];"],			
      ["Elem", "$$ = [$1];"],
      [", Elem", "$$ = [$2];"],			
      ["Elems , Elem", "$$ = $1; $1.push($3);"],
			["Elems ,", "$$ = $1"],			//allow additional ,;
		],		
		Exprs: [
      [",", "$$ = [];"],			
      ["Expr", "$$ = [$1];"],
      [", Expr", "$$ = [$2];"],			
      ["Exprs , Expr", "$$ = $1; $1.push($3);"],
			["Exprs ,", "$$ = $1"],			//allow additional ,;
		],		
		Get: [
			["Id . ID", "$$ = ['get', $1, ['str', $3]], 'obj'"],
			["Get . ID", "$$ = ['get', $1, ['str', $3], 'obj']"],
			["( Expr ) . ID", "$$ = ['get', $2, ['str', $5], 'obj']"],
			["Id [ Expr ]", "$$ = ['get', $1, $3, 'items']"],		
			["Get [ Expr ]", "$$ = ['get', $1, $3, 'items']"],			
			["( Expr ) [ Expr ]", "$$ = ['get', $2, $5, 'items']"],
			["Id -> ID", "$$ = ['get', $1, ['str', $3], 'class']"],
			["Get -> ID", "$$ = ['get', $1, ['str', $3], 'class']"],
			["( Expr ) -> ID", "$$ = ['get', $2, ['str', $5], 'class']"],
		],
		"FUNC": [
			["& Dic", "$$ = [$2, [[]]]"],
			["& Args Dic", "$$ = [$3, $2]"],
		],
		"Args": [
			["( )", "$$= [[]]"],
			["( Subdefs )", "$$= [$2]"],
			["Cn ( Subdefs )", "$$= [$3, $1]"],
			["Cn ( )", "$$= [[], $1]"],
		],
    "Subdefs": [
      ["Subdef", "$$ = [$1]; "],
			["Subdefs , Subdef", "$$ = $1; $1.push($3)"]
    ],
		"Subdef": [
			["ID", "$$ = [$1]"],
			["KeyColon Cn", "$$ = [$1, $2]"],
		],
		"Call": [
			["Id CallArgs", "$$ = ['call', $1, $2];"],
			["Get CallArgs", "$$ = ['call', $1, $2];"],
			["Call CallArgs", "$$ = ['call', $1, $2];"],
		],
		"Class":[
			["Parents Dic", "$2[2] = 'Dic';$$ = ['class', $1, $2]"],
			["< Parents >", "$$ = ['scope', $2]"],			
		],
		"Parents": [
			["< >", "$$ = []"],
			["< Cns >", "$$ = $2"],			
		],
		"Cns": [
			["Cn", "$$ = [$1]"],
			["Cns Cn", "$$ = $1; $1.push($2)"],			
		],
		"Cn": [
			["SubClass", "$$ = $1"],
			["ID", "$$ = ['idf', $1]"]
		],
		"Cons": [
			["ID { Elems }", "$$ = ['cons', ['idf', $1], ['dic', $3, 'Dic']];"],
		],
		"Obj": [
			["@ ID { }", "$$ = ['obj', ['idf', $2], ['dic', [], 'Dic']];"],
			["@ ID", "$$ = ['obj', ['idf', $2], ['dic', [], 'Dic']];"],
			["@ ID { Elems }", "$$ = ['obj', ['idf', $2], ['dic', $4, 'Dic']];"],
		],
		"CallArgs": [
			["( )", "$$ = []"],
			["( Exprs )", "$$ = $2"]
		],
		"Assign": "$$ = ['assign', $1]",
		"Assignable": [
			"Id",
			"Get"
		],
		"ASSIGN": [
			["Expr = Expr", "$$ = [$1, $3]"],
			["Expr += Expr", "$$ = [$1, $3, 'plus']"],
			["Expr ++", "$$ = [$1, ['num', '1'], 'plus']"],
			["Expr -= Expr", "$$ = [$3, $1, 'minus']"],
			["Expr --", "$$ = [$1, ['num', '1'], 'minus']"],
			["Expr *= Expr",  "$$ = [$1, $3, 'times']"],
			["Expr /= Expr",  "$$ = [$1, $3, 'obelus']"],
			["Expr ?= Expr",  "$$ = [$1, $3, 'definedor']"],
			["Expr ^= Expr",  "$$ = [$1, $3, 'splus']"],	      
		],
		"Op": "$$ = ['call', ['idf', $1[0]], $1[1]]",
		"OP": [
			["! Expr", "$$ = ['not', [$2]]"],
			["? Expr", "$$ = ['defined', [$2]]"],			
//			["Expr ? Expr : Expr", "$$ = ['if', [$1, $3, $5]]"],
//			["Expr ? Expr , : Expr", "$$ = ['if', [$1, $3, $6]]",      
//			["Expr ? Expr : ", "$$ = ['if', [$1, $3]]"],			
      //			["Expr ?? { Swtich }", "$$ = ['switch', [$1, $4]]"],
			["Expr ^ Expr", "$$ = ['splus', [$1, $3]]"],      
			["Expr + Expr", "$$ = ['plus', [$1, $3]]"],
			["Expr - Expr", "$$ = ['minus', [$1, $3]]"],
			["Expr * Expr", "$$ = ['times', [$1, $3]]"],
			["Expr / Expr", "$$ = ['obelus', [$1, $3]]"],
			["Expr >= Expr", "$$ = ['ge', [$1, $3]]"],
			["Expr <= Expr", "$$ = ['le', [$1, $3]]"],
			["Expr == Expr", "$$ = ['eq', [$1, $3]]"],
			["Expr != Expr", "$$ = ['ne', [$1, $3]]"],
			["Expr > Expr", "$$ = ['gt', [$1, $3]]"],
			["Expr < Expr", "$$ = ['lt', [$1, $3]]"],
			["Expr && Expr", "$$ = ['and', [$1, $3]]"],
			["Expr || Expr", "$$ = ['or', [$1, $3]]"],
		],
  }
};
for(var k in grammar.bnf){
	var v = grammar.bnf[k];
	if(typeof v == "string"){
		grammar.bnf[k] = [[k.toUpperCase(), v]]
		continue;
	}
	for(var k2 in v){
		var v2 = v[k2];
		if(typeof v2 == "string"){
			v[k2] = [v2, "$$ = $1"];
		}
	}
}
var options = {};
var code = new jison.Generator(grammar, options).generate();
var filename = process.argv[2];
fs.writeFileSync(filename, code);
