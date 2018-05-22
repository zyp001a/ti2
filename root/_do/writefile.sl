=>(file: String, str: String){
	$fd = open(file, 'w');
	write(fd, str);
	close(fd);
}