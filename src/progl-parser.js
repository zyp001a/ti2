/* parser generated by jison 0.4.18 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,3],$V1=[1,4],$V2=[1,5],$V3=[1,6],$V4=[1,7],$V5=[1,8],$V6=[1,9],$V7=[1,19],$V8=[1,20],$V9=[1,24],$Va=[1,21],$Vb=[1,27],$Vc=[1,28],$Vd=[1,23],$Ve=[1,31],$Vf=[1,29],$Vg=[1,30],$Vh=[1,32],$Vi=[1,33],$Vj=[1,34],$Vk=[1,35],$Vl=[1,36],$Vm=[1,37],$Vn=[1,38],$Vo=[1,39],$Vp=[1,40],$Vq=[1,41],$Vr=[1,22,23,28,30,40,41,43,44,45,46,47,48,49,50,51,52,54],$Vs=[2,18],$Vt=[1,56],$Vu=[1,67],$Vv=[1,66],$Vw=[1,62],$Vx=[1,63],$Vy=[1,86],$Vz=[1,85],$VA=[1,84],$VB=[1,87],$VC=[1,95],$VD=[23,28,30,54],$VE=[1,101],$VF=[2,53],$VG=[1,100],$VH=[1,22,23,28,30,54],$VI=[1,22,23,28,30,40,41,43,44,47,48,49,50,51,52,54],$VJ=[1,22,23,28,30,40,41,47,48,49,50,51,52,54],$VK=[1,22,23,25,28,30,40,41,43,44,45,46,47,48,49,50,51,52,54],$VL=[23,27,30],$VM=[23,30];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Start":3,"Raw":4,"Number":5,"String":6,"Undefined":7,"Native":8,"@":9,"Id":10,"Reg":11,"Addr":12,"Block":13,"Function":14,"Class":15,"Hash":16,"Rels":17,"Call":18,"Assign":19,"New":20,"~":21,"(":22,")":23,"Relstr":24,".":25,"KeyCall":26,"{":27,"}":28,"Raws":29,",":30,"KeyColon":31,":":32,"=>":33,"FunctionBody":34,"Argdef":35,"Subdefs":36,"Subdef":37,"CallRaw":38,"Op":39,"=":40,"+=":41,"!":42,"+":43,"-":44,"*":45,"/":46,">=":47,"<=":48,"==":49,"!=":50,">":51,"<":52,"[":53,"]":54,"$accept":0,"$end":1},
terminals_: {2:"error",5:"Number",6:"String",7:"Undefined",8:"Native",9:"@",10:"Id",11:"Reg",21:"~",22:"(",23:")",24:"Relstr",25:".",27:"{",28:"}",30:",",32:":",33:"=>",40:"=",41:"+=",42:"!",43:"+",44:"-",45:"*",46:"/",47:">=",48:"<=",49:"==",50:"!=",51:">",52:"<",53:"[",54:"]"},
productions_: [0,[3,1],[4,1],[4,1],[4,1],[4,1],[4,2],[4,1],[4,1],[4,2],[4,2],[4,1],[4,1],[4,1],[4,1],[4,1],[4,2],[4,1],[4,1],[4,1],[4,1],[4,2],[4,3],[17,1],[12,3],[12,3],[12,3],[12,5],[26,1],[26,1],[26,1],[26,3],[13,2],[13,3],[29,1],[29,1],[29,2],[29,3],[29,2],[31,2],[31,2],[31,2],[15,4],[14,1],[14,2],[34,2],[34,3],[34,4],[35,2],[35,3],[35,1],[36,1],[36,3],[37,1],[37,2],[18,1],[18,1],[38,3],[38,4],[20,3],[20,4],[19,3],[19,3],[39,2],[39,3],[39,3],[39,3],[39,3],[39,3],[39,3],[39,3],[39,3],[39,3],[39,3],[16,2],[16,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
return this.$ = $$[$0]
break;
case 2:
this.$ = ['obj', 'Number', Number($$[$0])]
break;
case 3: case 28: case 29: case 30:
this.$ = ['obj', 'String', $$[$0]]
break;
case 4:
this.$ = ['obj', 'Undefined']
break;
case 5:
this.$ = ['native', $$[$0]]
break;
case 6:
this.$ = ['tpl', $$[$0]]
break;
case 7:
this.$ = ['id', $$[$0]]
break;
case 8:
this.$ = ['reg', $$[$0]]
break;
case 9: case 10:
this.$ = ['global', $$[$0]]
break;
case 11:
this.$ = ['addr', $$[$0]]
break;
case 12:
this.$ = ['block', $$[$0]]
break;
case 13:
this.$ = ['function', $$[$0]]
break;
case 14:
this.$ = ['class', $$[$0]]
break;
case 15:
this.$ = ['hash', $$[$0]]
break;
case 16:
this.$ = ['cpt', $$[$0], $$[$0-1]]
break;
case 17:
this.$ = ['brch', $$[$0]]
break;
case 18:
this.$ = ['call', $$[$0]]
break;
case 19:
this.$ = ['assign', $$[$0]]
break;
case 20:
this.$ = ['new', $$[$0]]
break;
case 21:
this.$ = ['return', $$[$0]]
break;
case 22: case 33: case 38: case 39: case 40: case 41: case 75:
this.$ = $$[$0-1]
break;
case 23:
this.$ = $$[$0].split(/\s+/)
break;
case 24:
this.$ = [['id', $$[$0-2]], $$[$0]]
break;
case 25:
this.$ = [['obj', 'String', $$[$0-2]], $$[$0]]
break;
case 26:
this.$ = [['addr', $$[$0-2]], $$[$0]]
break;
case 27:
this.$ = [$$[$0-3], $$[$0]]
break;
case 31:
this.$ = ['call', $$[$0-1]]
break;
case 32: case 48:
this.$= []
break;
case 34:
this.$ = [];
break;
case 35: case 36:
this.$ = [$$[$0]];
break;
case 37:
this.$ = $$[$0-2]; $$[$0-2].push($$[$0]);
break;
case 42:
this.$= [$$[$0], $$[$0-1], $$[$0-3]]
break;
case 43:
this.$= $$[$0];
break;
case 44:
this.$= $$[$0]; this.$[3] = $$[$0-1]
break;
case 45:
this.$ = [$$[$0], []]
break;
case 46:
this.$ = [$$[$0], $$[$0-1]]
break;
case 47:
this.$ = [$$[$0], $$[$0-1], $$[$0-2]]
break;
case 49:
this.$= $$[$0-1]
break;
case 50:
this.$=[$$[$0]]
break;
case 51:
this.$ = [$$[$0]]; 
break;
case 52:
this.$ = $$[$0-2]; $$[$0-2].push($$[$0])
break;
case 53:
this.$ = [$$[$0]]
break;
case 54:
this.$ = [$$[$0-1], $$[$0]]
break;
case 55: case 56:
this.$ = $$[$0]
break;
case 57: case 59:
this.$ = [$$[$0-2], []];
break;
case 58: case 60:
this.$ = [$$[$0-3], $$[$0-1]];
break;
case 61:
this.$ = [$$[$0-2], $$[$0]]
break;
case 62:
this.$ = [$$[$0-2], ['call', [ ['id', 'plus'], [$$[$0-2], $$[$0]] ] ]]
break;
case 63:
this.$ = [['id', 'not'], [$$[$0]]]
break;
case 64:
this.$ = [['id', 'plus'], [$$[$0-2], $$[$0]]]
break;
case 65:
this.$ = [['id', 'minus'], [$$[$0-2], $$[$0]]]
break;
case 66:
this.$ = [['id', 'times'], [$$[$0-2], $$[$0]]]
break;
case 67:
this.$ = [['id', 'obelus'], [$$[$0-2], $$[$0]]]
break;
case 68:
this.$ = [['id', 'ge'], [$$[$0-2], $$[$0]]]
break;
case 69:
this.$ = [['id', 'le'], [$$[$0-2], $$[$0]]]
break;
case 70:
this.$ = [['id', 'eq'], [$$[$0-2], $$[$0]]]
break;
case 71:
this.$ = [['id', 'ne'], [$$[$0-2], $$[$0]]]
break;
case 72:
this.$ = [['id', 'gt'], [$$[$0-2], $$[$0]]]
break;
case 73:
this.$ = [['id', 'lt'], [$$[$0-2], $$[$0]]]
break;
case 74:
this.$ = []
break;
}
},
table: [{3:1,4:2,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{1:[3]},{1:[2,1],22:$Ve,40:$Vf,41:$Vg,43:$Vh,44:$Vi,45:$Vj,46:$Vk,47:$Vl,48:$Vm,49:$Vn,50:$Vo,51:$Vp,52:$Vq},o($Vr,[2,2]),o($Vr,[2,3],{25:[1,42]}),o($Vr,[2,4]),o($Vr,[2,5]),{6:[1,45],8:[1,43],10:[1,44]},o($Vr,[2,7],{34:47,25:[1,46],27:[1,49],33:[1,48]}),o($Vr,[2,8]),o($Vr,[2,11],{25:[1,50]}),o($Vr,[2,12]),o($Vr,[2,13]),o($Vr,[2,14]),o($Vr,[2,15]),o($Vr,[2,17],{16:51,53:$Vd}),o($Vr,$Vs),o($Vr,[2,19]),o($Vr,[2,20]),{4:52,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:53,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:57,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,28:[1,54],29:55,30:$Vt,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},o($Vr,[2,43]),{4:57,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,29:59,30:$Vt,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd,54:[1,58]},o([1,22,23,27,28,30,40,41,43,44,45,46,47,48,49,50,51,52,53,54],[2,23]),o($Vr,[2,55]),o($Vr,[2,56]),{5:$Vu,6:$Vv,10:$Vw,13:60,22:$Vx,27:$Va,31:65,35:61,37:64},{4:68,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:69,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:70,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:57,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,23:[1,71],24:$V9,27:$Va,29:72,30:$Vt,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:73,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:74,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:75,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:76,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:77,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:78,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:79,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:80,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:81,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{4:82,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{5:$Vy,6:$Vz,10:$VA,22:$VB,26:83},o($Vr,[2,6]),o($Vr,[2,9]),o($Vr,[2,10]),{5:$Vy,6:$Vz,10:$VA,22:$VB,26:88},o($Vr,[2,44]),{5:$Vu,6:$Vv,10:$Vw,13:60,17:89,22:$Vx,24:$V9,27:$Va,31:65,35:61,37:64},{4:57,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,28:[1,90],29:91,30:$Vt,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},{5:$Vy,6:$Vz,10:$VA,22:$VB,26:92},o($Vr,[2,16]),o([1,23,28,30,54],[2,21],{22:$Ve,40:$Vf,41:$Vg,43:$Vh,44:$Vi,45:$Vj,46:$Vk,47:$Vl,48:$Vm,49:$Vn,50:$Vo,51:$Vp,52:$Vq}),{22:$Ve,23:[1,93],40:$Vf,41:$Vg,43:$Vh,44:$Vi,45:$Vj,46:$Vk,47:$Vl,48:$Vm,49:$Vn,50:$Vo,51:$Vp,52:$Vq},o($Vr,[2,32]),{28:[1,94],30:$VC},o($VD,[2,34],{12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,34:22,38:25,39:26,4:96,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,42:$Vc,53:$Vd}),o($VD,[2,35],{22:$Ve,40:$Vf,41:$Vg,43:$Vh,44:$Vi,45:$Vj,46:$Vk,47:$Vl,48:$Vm,49:$Vn,50:$Vo,51:$Vp,52:$Vq}),o($Vr,[2,74]),{30:$VC,54:[1,97]},o($Vr,[2,45]),{13:98,27:$Va},{5:$Vu,6:$Vv,10:$VE,22:$Vx,27:$VF,31:65,32:$VG,35:99,37:64},{5:$Vu,6:$Vv,10:$VE,23:[1,102],31:65,36:103,37:104},{27:[2,50]},{10:[1,105]},{32:[1,106]},{32:[1,107]},o($Vr,[2,63]),o($VH,[2,61],{40:$Vf,41:$Vg,43:$Vh,44:$Vi,45:$Vj,46:$Vk,47:$Vl,48:$Vm,49:$Vn,50:$Vo,51:$Vp,52:$Vq}),o($VH,[2,62],{40:$Vf,41:$Vg,43:$Vh,44:$Vi,45:$Vj,46:$Vk,47:$Vl,48:$Vm,49:$Vn,50:$Vo,51:$Vp,52:$Vq}),o($Vr,[2,57]),{23:[1,108],30:$VC},o($VI,[2,64],{45:$Vj,46:$Vk}),o($VI,[2,65],{45:$Vj,46:$Vk}),o($Vr,[2,66]),o($Vr,[2,67]),o($VJ,[2,68],{43:$Vh,44:$Vi,45:$Vj,46:$Vk}),o($VJ,[2,69],{43:$Vh,44:$Vi,45:$Vj,46:$Vk}),o($VJ,[2,70],{43:$Vh,44:$Vi,45:$Vj,46:$Vk}),o($VJ,[2,71],{43:$Vh,44:$Vi,45:$Vj,46:$Vk}),o($VJ,[2,72],{43:$Vh,44:$Vi,45:$Vj,46:$Vk}),o($VJ,[2,73],{43:$Vh,44:$Vi,45:$Vj,46:$Vk}),o($VK,[2,25]),o($VK,[2,28]),o($VK,[2,29]),o($VK,[2,30]),{4:110,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,12:10,13:11,14:12,15:13,16:14,17:15,18:109,19:17,20:18,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,34:22,38:25,39:26,42:$Vc,53:$Vd},o($VK,[2,24]),{13:111,27:$Va},o($Vr,[2,59]),{28:[1,112],30:$VC},o($VK,[2,26]),o($Vr,[2,22],{25:[1,113]}),o($Vr,[2,33]),o($VD,[2,38],{12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:18,34:22,38:25,39:26,4:114,5:$V0,6:$V1,7:$V2,8:$V3,9:$V4,10:$V5,11:$V6,21:$V7,22:$V8,24:$V9,27:$Va,33:$Vb,42:$Vc,53:$Vd}),o($VD,[2,36],{22:$Ve,40:$Vf,41:$Vg,43:$Vh,44:$Vi,45:$Vj,46:$Vk,47:$Vl,48:$Vm,49:$Vn,50:$Vo,51:$Vp,52:$Vq}),o($Vr,[2,75]),o($Vr,[2,46]),{13:115,27:$Va},{10:[2,39]},o($VL,$VF,{32:$VG}),{27:[2,48]},{23:[1,116],30:[1,117]},o($VM,[2,51]),o($VL,[2,54]),{10:[2,40]},{10:[2,41]},o($Vr,[2,58]),o([22,40,41,43,44,45,46,47,48,49,50,51,52],$Vs,{23:[1,118]}),{22:$Ve,40:$Vf,41:$Vg,43:$Vh,44:$Vi,45:$Vj,46:$Vk,47:$Vl,48:$Vm,49:$Vn,50:$Vo,51:$Vp,52:$Vq},o($Vr,[2,42]),o($Vr,[2,60]),{5:$Vy,6:$Vz,10:$VA,22:$VB,26:119},o($VD,[2,37],{22:$Ve,40:$Vf,41:$Vg,43:$Vh,44:$Vi,45:$Vj,46:$Vk,47:$Vl,48:$Vm,49:$Vn,50:$Vo,51:$Vp,52:$Vq}),o($Vr,[2,47]),{27:[2,49]},{5:$Vu,6:$Vv,10:$VE,31:65,37:120},o($VK,[2,31]),o($VK,[2,27]),o($VM,[2,52])],
defaultActions: {64:[2,50],100:[2,39],102:[2,48],106:[2,40],107:[2,41],116:[2,49]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        var lex = function () {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        };
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:return;
break;
case 1:return;
break;
case 2:return;
break;
case 3:yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2); return 8;
break;
case 4:yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2); return 6;
break;
case 5:yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2); return 6;
break;
case 6:yy_.yytext = yy_.yytext.replace(/^<\s*/, '').replace(/\s*>$/, ''); return 24;
break;
case 7:return
break;
case 8:return 10
break;
case 9:yy_.yytext = yy_.yytext.substr(1);return 11
break;
case 10:yy_.yytext = yy_.yytext.substr(1);return 11
break;
case 11:return 5;
break;
case 12:return 25
break;
case 13:return 33
break;
case 14:return 22
break;
case 15:return 23
break;
case 16:return 53
break;
case 17:return 54
break;
case 18:return 27
break;
case 19:return 28
break;
case 20:return '=?'
break;
case 21:return 47
break;
case 22:return 48
break;
case 23:return 49
break;
case 24:return 50
break;
case 25:return 41
break;
case 26:return '-='
break;
case 27:return '*='
break;
case 28:return '/='
break;
case 29:return '||'
break;
case 30:return '&&'
break;
case 31:return 51
break;
case 32:return 52
break;
case 33:return '&'
break;
case 34:return 9
break;
case 35:return 42
break;
case 36:return 21
break;
case 37:return 40
break;
case 38:return 43
break;
case 39:return 44
break;
case 40:return 45
break;
case 41:return 46
break;
case 42:return '%'
break;
case 43:return '^'
break;
case 44:return 25
break;
case 45:return 32
break;
case 46:return 30
break;
case 47:return 7
break;
case 48:return
break;
}
},
rules: [/^(?:\/\*[\S\s]*\*\/)/,/^(?:\#[^\n\r]+[\n\r]*)/,/^(?:\/\/[^\n\r]+[\n\r]*)/,/^(?:`(\.|[^\`])*`)/,/^(?:"(\.|[^\"])*")/,/^(?:'(\.|[^\'])*')/,/^(?:<(?:([a-zA-Z_])|([0-9])|\s)*>)/,/^(?:\\[\r\n;]+)/,/^(?:([a-zA-Z_])(([a-zA-Z_])|([0-9]))*)/,/^(?:\$([a-zA-Z_])(([a-zA-Z_])|([0-9]))*)/,/^(?:\$([0-9])*)/,/^(?:(-?(?:[0-9]|[1-9][0-9]+))((?:\.[0-9]+))?((?:[eE][-+]?[0-9]+))?\b)/,/^(?:\.)/,/^(?:\=\>)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\{)/,/^(?:\})/,/^(?:\=\?)/,/^(?:\>\=)/,/^(?:\<\=)/,/^(?:\=\=)/,/^(?:\!\=)/,/^(?:\+\=)/,/^(?:\-\=)/,/^(?:\*\=)/,/^(?:\/\=)/,/^(?:\|\|)/,/^(?:\&\&)/,/^(?:\>)/,/^(?:\<)/,/^(?:\&)/,/^(?:\@)/,/^(?:\!)/,/^(?:\~)/,/^(?:=)/,/^(?:\+)/,/^(?:\-)/,/^(?:\*)/,/^(?:\/)/,/^(?:\%)/,/^(?:\^)/,/^(?:\.)/,/^(?:\:)/,/^(?:([\n\r;,]+))/,/^(?:\_)/,/^(?:\s)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}