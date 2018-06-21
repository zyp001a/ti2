`~
$s = $_0
$conf = $_1
conf.engine ?= "InnoDB"
conf.db ?= "db"+autoname()
$foreigns = @{}
~
CREATE DATABASE IF NOT EXISTS ~=conf.db~;
USE ~=conf.db~;
set storage_engine = ~=conf.engine~;
-- InnoDB MyISAM Falcon PBXT Maria
~each($k, $v, s, {~
DROP TABLE IF EXISTS ~=k~,
CREATE TABLE ~=k~ (
  id    int(10) UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE,
~each($k2, $v2, v, {
~
  ~=k2~    ~=mysql_totype(k2, v2, foreigns)~,
~})~
~each($k, $v, foreigns, {~
  FOREIGN KEY (~=k~)  REFERENCES ~=v[0]~ (~=v[1]~)    ON DELETE CASCADE,
~})~
  PRIMARY KEY (id)
);

~})~
`
