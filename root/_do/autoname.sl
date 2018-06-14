=>(~String){
 if(!global.autonamecount, global.autonamecount = 0);
 global.autonamecount += 1;
 ~string(global.autonamecount)
}