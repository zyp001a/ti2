/*
	multiple line comment
*/
# single line comment
// single line comment
/*
 "' are the replacable
 ;,\n\r are the replacable
*/
a = 1
b = "string";
c = 'string',

/*
 => is function
 ~ is return
*/
=> {}
=> a{}
=> (a, b){}
=> Number (a, b){ ~1 }

/*
 hash array
*/
a = [key1=1, key2=2]
b = [1, 2]

//below are all changable external functions
/*
 if switch
*/
#if condition1 statement1 condition2 statement2 ... else_statement
condition?statement:else_statement
a?{
}:a?{
}:{
}
a=="first"; {print(1)}
a=="second"; {print(2)}
{print("else")}
)
a==1?print(1):print(2)


/*
 for each fe cfor
*/
for(a, [1,2], {print(a)}) //"0", "1"
for(a, [x=1,y=2], {print(a)}) //"x", "y"
each(a, [1,2], {print(a)}) //1, 2
fe(a, b, [x=1,y=2], {{print(a); print(b)}) //"x", 1, "y", 2
cfor(a=1; a<3; a+=1; {print(a)}) //1, 2