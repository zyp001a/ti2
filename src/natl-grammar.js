var jison = require("jison");
var fs = require("fs");
var grammar = {
  "lex": {
    "macros": {
      "digit": "[0-9]",
			"letter": "[a-zA-Z_']",
      "esc": "\\\\",
      "int": "-?(?:[0-9]+)",
      "exp": "(?:[eE][-+]?[0-9]+)",
      "frac": "(?:\\.[0-9]+)",
    },
    "rules": [
			["`(\\\\.|[^\\\\`])*`", 
			 "yytext = yytext.substr(1, yyleng-2).replace(/\\\\`/g, '`'); return 'Tpl';"],      
			["\"(\\\\.|[^\\\\\"])*\"",
			 "yytext = yytext.substr(1, yyleng-2).replace(/\\\\u([0-9a-fA-F]{4})/, function(m, n){ return String.fromCharCode(parseInt(n, 16)) }).replace(/\\\\(.)/g, function(m, n){ if(n == 'n') return '\\n';if(n == 'r') return '\\r';if(n == 't') return '\\t'; return n;}); return 'Quote';"],       ["{int}\\b", "return 'Int';"],
      ["{int}{frac}?{exp}?\\b", "return 'Number';"],      
			["\\$?{letter}({letter}|{digit})*", "return 'Symbol'"],
			["{digit}+{letter}", "return 'Quantity'"],
      [".", "return '.'"],
      [",", "return ','"],
      ["\{", "return '{'"],
      ["\}", "return '}'"],
      ["[\\n\\r]+", "return 'LN'"],			
      [".", "return"],			
    ]
  },
  "start": "Start",
  "bnf": {
		"Start": [
			["Article", "return $$ = $1"]
		],
		"Article": [
			["Paragraph", "$$ = [$1]"],
			["Article LN Paragraph", "$$ = $1; $1.push($3)"],
		],
		"Paragraph": [
			["Sentence", "$$ = [$1]"],
			["Paragraph . Sentence", "$$ = $1; $1.push($3)"],
		],
		"Sentence": [
			["Subsentence", "$$ = [$1]"],
			["Sentence , Subsentence", "$$ = $1; $1.s.push($3)"],
		],
		"Subsentence": [
			["Word", "$$ = [$1]"],
			["Subsentence Word", "$$ = $1; $1.push($2)"],
		],
		"Word": [
			["Int", "$$ = ['int', $1]"],
			["Number", "$$ = ['number', $1]"],
			["Quote", "$$ = ['quote', $1]"],			
			["Symbol", "$$ = ['symbol', $1]"],
			["Quantity", "$$ = ['quantity', $1]"],
		]
  }
};
var options = {};
var code = new jison.Generator(grammar, options).generate();
fs.writeFileSync(__dirname + '/natl-parser.js', code);

