=>(c: Callable){
 $u = uncall(c)
 ~get(idglobal("_out"), u.1)(u.0)
}