=>(k:String, x:Array, foreigns: Dic){
  $s = "";
  x[2] ? $c = x[2] : $c = @{}
  x[0] == Int?{
    c.size ?= 4
    c.size == 1?$t = "tinyint"
    :c.size == 2?$t = "smallint"
    :c.size == 3?$t = "mediumint"
    :c.size == 4?$t = "int"
    :c.size == 8?$t = "bigint"
    :print("wrong int size for mysql: "+c.size)
    s += t
    c.width?s+="("+c.width+")":
  }:x[0] == Number?{
    (c.precision || c.scale)?{
      c.precision ?= 10
      c.scale ?= 2
      s += "decimal("+c.precision+","+c.scale+")"
    }:c.double?{
      s += "double"    
    }:{
      s += "float"
    }
  }:x[0] == String?{
    c.size ?= 4
    c.char ? $t = "char": $t = "varchar"
    c.blob ? s += "blob" : {
      s += t+"("+c.size+")"
    }
  }:x[0] == Date?{
    s += "date"
  }:x[0] == Time?{
    s += "time"
    c.size ? s+= "("+c.size+")":
  }:x[0] == Datetime?{
    s += "datetime"
    c.size ? s+= "("+c.size+")":  
  }:x[0] == Timestamp?{
    s += "timestamp"
    c.size ? s+= "("+c.size+")":
  }:
  c.unsigned?s+= " UNSIGNED":    
  c.zerofil?s+= " ZEROFILL":
  defined(x[1])?s+= " NOT NULL DEFAULT '"+ x[1]+ "'"
    :c.notnull? s+= " NOT NULL":
  c.ref?foreigns[k] = c.ref:
  ~s
}