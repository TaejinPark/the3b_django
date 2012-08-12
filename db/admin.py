from django.contrib import admin
from db.models import *

class MemberAdmin(admin.ModelAdmin):
	list_display = ('userID', 'nickname','password','sessionid','penalty')

class RoomAdmin(admin.ModelAdmin):
	list_display = ('seq' , 'name','participant' ,'maxuser', 'private', 'roomtype', 'gametype', 'owner', 'start', 'password', 'gameoption')

class ResultAdmin(admin.ModelAdmin):
	list_display = ('userID', 'gametype', 'result', 'time')

class MemberInRoomAdmin(admin.ModelAdmin):
	list_display = ('room_seq', 'userID', 'ready')

admin.site.register(Member,MemberAdmin)
admin.site.register(Room,RoomAdmin)
admin.site.register(Result,ResultAdmin)
admin.site.register(MemberInRoom,MemberInRoomAdmin)