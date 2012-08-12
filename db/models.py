# -*- coding: utf-8 -*-
from django.db import models

GAME_TYPE =((u'B',u'빙고'),
			(u'D',u'주사위'),
			(u'P',u'해적 룰렛'),
			(u'L',u'사다리 타기'))


class Member(models.Model):# member db table
	userID 	 	= models.CharField(max_length=80,primary_key=True) #user id 
	password 	= models.CharField(max_length=32)# password
	nickname 	= models.CharField(max_length=100)# user nickname
	sessionid 	= models.CharField(max_length=32,default=0,null=True,blank=True)# coockie session id
	penalty  	= models.PositiveSmallIntegerField(max_length=10,default=0,null=True,blank=True)

	def entries(self):
		print type(self) , self.userID , self.nickname , self.password , self.sessionid
	

class Result(models.Model):#Result of game db table	
	OUTCOME=(	(u'W',u'승리'),
				(u'L',u'패배'))

	userID 		= models.CharField(max_length=80) #user id 
	gametype 	= models.CharField(max_length=2,choices=GAME_TYPE,default=u'B')
	result 		= models.CharField(max_length=2,choices=OUTCOME,default=u'W');
	time 		= models.DateTimeField(auto_now_add=True,auto_now=True)

	def entries(self):
		print type(self) , self.userID , self.gametype , self.result , self.time



class Room(models.Model):#Game room information db table
	ROOM_TYPE =((u'I',u'일회방'),
				(u'N',u'일반방'))

	START_FLAG=((u'S',u'시작'),
				(u'W',u'대기'))

	PRIVATE_FLAG=((u'S',u'비밀방'),
				  (u'P',u'공개방'))

	MAX_USER=(	(2,'2명'),
				(3,'3명'),
				(4,'4명'),
				(5,'5명'),
				(6,'6명'),
				(7,'7명'),
				(8,'8명') )

	seq			= models.AutoField(primary_key=True)
	name		= models.CharField(max_length=100) #room title
	maxuser 	= models.PositiveSmallIntegerField(max_length=1,choices=MAX_USER) #max number
	participant = models.PositiveSmallIntegerField(max_length=1,default=1)
	private 	= models.CharField(max_length=1,choices=PRIVATE_FLAG) #public or non-public
	roomtype 	= models.CharField(max_length=1,choices=ROOM_TYPE) #instance or normal
	gametype 	= models.CharField(max_length=2,choices=GAME_TYPE) #bingo , dice , pirate , ladder
	owner 		= models.CharField(max_length=80) # owner
	start 		= models.CharField(max_length=1,choices=START_FLAG,default=u'W') # is game start ?
	password 	= models.CharField(max_length=32,null=True,blank=True) # room password
	gameoption 	= models.TextField(null=True,blank=True) # game option


	def entries(self):
		print type(self) , self.name ,',', self.maxuser ,',', self.private ,',', self.roomtype ,',', 
		print self.gametype ,',', self.owner.userID ,',', self.start ,',', self.password ,',', self.gameoption


class MemberInRoom(models.Model):
	READY_FLAG=((u'R',u'준비'),
				(u'W',u'대기'))

	room_seq	= models.PositiveIntegerField()
	userID		= models.CharField(max_length=80)
	ready		= models.CharField(max_length=1,choices=READY_FLAG,default=u'W')
	anonymous	= models.PositiveSmallIntegerField(max_length=1,default=0)
	
	def entries(self):
		print type(self) , self.room_seq , self.userID , self.ready , self.anonymous









