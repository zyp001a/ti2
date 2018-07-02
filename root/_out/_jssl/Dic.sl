`dic({
~each($k, $v, $_0, {
~~=global.indent+"\""+k+"\":"+gen(v)~,
~
})~}, ~=gen(getrels($_0))~)`