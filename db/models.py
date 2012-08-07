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

class Member(models.Model):
	userID 	 	= models.CharField(max_length=80,null=False,primary_key=True)
	password 	= models.CharField(max_length=32,null=False)
	nickname 	= models.CharField(max_length=100,null=False)
	penalty  	= models.PositiveSmallIntegerField(default=0,null=True)
	sessionid 	= models.CharField(max_length=32,blank=True)
	participation=models.ForeignKey('Room',blank=True,null=True)


class Result(models.Model):
	userID 		= models.ForeignKey('Member',null=False)
	gametype 	= models.CharField(max_length=2,choices=GAME_TYPE,null=False)
	result 		= models.CharField(max_length=1,choices=OUTCOME,default=u'W',null=False);
	time 		= models.DateTimeField(auto_now_add=True,auto_now=True)
	


class Room(models.Model):

	title		= models.CharField(max_length=100,null=False)
	maxuser 	= models.PositiveSmallIntegerField(max_length=1,choices=MAX_USER,null=False)
	private 	= models.CharField(max_length=1,choices=PRIVATE_FLAG,null=False)
	roomtype 	= models.CharField(max_length=1,choices=ROOM_TYPE,null=False)
	gametype 	= models.CharField(max_length=2,choices=GAME_TYPE,null=False)
	owner 		= models.ForeignKey('Member',null=False)
	start 		= models.CharField(max_length=1,choices=START_FLAG,default=u'W')
	password 	= models.CharField(max_length=32,null=True,blank=True)
	gameoption 	= models.TextField(null=True,blank=True)
