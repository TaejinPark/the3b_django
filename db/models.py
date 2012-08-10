# -*- coding: utf-8 -*-
from django.db import models

GAME_TYPE =((u'B',u'빙고'),
			(u'D',u'주사위'),
			(u'P',u'해적 룰렛'),
			(u'L',u'사다리 타기'))

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

OUTCOME=((	u'W',u'승리'),
			(u'L',u'패배'))


class Member(models.Model):# member db table
	userID 	 	= models.CharField(max_length=80,primary_key=True) #user id 
	password 	= models.CharField(max_length=32)# password
	nickname 	= models.CharField(max_length=100)# user nickname
	penalty  	= models.PositiveSmallIntegerField(max_length=10,default=0,null=True)
	participation=models.ForeignKey('Room',blank=True,null=True)

class Result(models.Model):
	userID 		= models.ForeignKey('Member')
	gametype 	= models.CharField(max_length=2,choices=GAME_TYPE)
	result 		= models.CharField(max_length=1,choices=OUTCOME,default=u'W');
	time 		= models.DateTimeField(auto_now_add=True,auto_now=True)
	def __unicode__(self):
		return self.id

class Room(models.Model):
	title		= models.CharField(max_length=100)
	maxuser 	= models.PositiveSmallIntegerField(max_length=1,choices=MAX_USER)
	private 	= models.CharField(max_length=1,choices=PRIVATE_FLAG)
	roomtype 	= models.CharField(max_length=1,choices=ROOM_TYPE)
	gametype 	= models.CharField(max_length=2,choices=GAME_TYPE)
	owner 		= models.ForeignKey('Member')
	start 		= models.CharField(max_length=1,choices=START_FLAG,default=u'W')
	password 	= models.CharField(max_length=32,null=True,blank=True)
	gameoption 	= models.TextField(null=True,blank=True)

	def __unicode__(self):
		return self.id
