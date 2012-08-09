def isLogin(request):
	if request.session['userID'] == m.userID:
		return true
	else:
		return False

def discardSession(request):
	request.session['userID'] = 0