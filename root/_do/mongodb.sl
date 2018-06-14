=>(obj: Addr, cmd: String, conf: Dic){
 cmd??{
   connect: {print("connect")}
   select: {print("select")}
 }
}