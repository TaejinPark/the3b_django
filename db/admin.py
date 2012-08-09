from django.contrib import admin
from db.models import Member
from db.models import Room
from db.models import Result

class MemberAdmin(admin.ModelAdmin):
	list_display = ('userID', 'nickname','password','participation','penalty')

class RoomAdmin(admin.ModelAdmin):
	list_display = ('title', 'maxuser', 'private', 'roomtype', 'gametype', 'owner', 'start', 'password', 'gameoption')

class ResultAdmin(admin.ModelAdmin):
	list_display = ('userID', 'gametype', 'result', 'time')

admin.site.register(Member,MemberAdmin)
admin.site.register(Room,RoomAdmin)
admin.site.register(Result,ResultAdmin)