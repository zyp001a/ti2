=>(str:String, scope){
 $ast = parseProgl(str)
 ~ast2elem(ast, scope)
}