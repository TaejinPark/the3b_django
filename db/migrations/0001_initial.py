# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Member'
        db.create_table('db_member', (
            ('userID', self.gf('django.db.models.fields.CharField')(max_length=80, primary_key=True)),
            ('password', self.gf('django.db.models.fields.CharField')(max_length=32)),
            ('nickname', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('sessionid', self.gf('django.db.models.fields.CharField')(default=0, max_length=32, null=True, blank=True)),
            ('penalty', self.gf('django.db.models.fields.PositiveSmallIntegerField')(default=0, max_length=10, null=True, blank=True)),
            ('participation', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['db.Room'], null=True, blank=True)),
        ))
        db.send_create_signal('db', ['Member'])

        # Adding model 'Result'
        db.create_table('db_result', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('userID', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['db.Member'])),
            ('gametype', self.gf('django.db.models.fields.CharField')(max_length=2)),
            ('result', self.gf('django.db.models.fields.CharField')(default=u'W', max_length=1)),
            ('time', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, auto_now_add=True, blank=True)),
        ))
        db.send_create_signal('db', ['Result'])

        # Adding model 'Room'
        db.create_table('db_room', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('maxuser', self.gf('django.db.models.fields.PositiveSmallIntegerField')(max_length=1)),
            ('private', self.gf('django.db.models.fields.CharField')(max_length=1)),
            ('roomtype', self.gf('django.db.models.fields.CharField')(max_length=1)),
            ('gametype', self.gf('django.db.models.fields.CharField')(max_length=2)),
            ('owner', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['db.Member'])),
            ('start', self.gf('django.db.models.fields.CharField')(default=u'W', max_length=1)),
            ('password', self.gf('django.db.models.fields.CharField')(max_length=32, null=True, blank=True)),
            ('gameoption', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal('db', ['Room'])


    def backwards(self, orm):
        # Deleting model 'Member'
        db.delete_table('db_member')

        # Deleting model 'Result'
        db.delete_table('db_result')

        # Deleting model 'Room'
        db.delete_table('db_room')


    models = {
        'db.member': {
            'Meta': {'object_name': 'Member'},
            'nickname': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'participation': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['db.Room']", 'null': 'True', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'penalty': ('django.db.models.fields.PositiveSmallIntegerField', [], {'default': '0', 'max_length': '10', 'null': 'True', 'blank': 'True'}),
            'sessionid': ('django.db.models.fields.CharField', [], {'default': '0', 'max_length': '32', 'null': 'True', 'blank': 'True'}),
            'userID': ('django.db.models.fields.CharField', [], {'max_length': '80', 'primary_key': 'True'})
        },
        'db.result': {
            'Meta': {'object_name': 'Result'},
            'gametype': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'result': ('django.db.models.fields.CharField', [], {'default': "u'W'", 'max_length': '1'}),
            'time': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'auto_now_add': 'True', 'blank': 'True'}),
            'userID': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['db.Member']"})
        },
        'db.room': {
            'Meta': {'object_name': 'Room'},
            'gameoption': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'gametype': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'maxuser': ('django.db.models.fields.PositiveSmallIntegerField', [], {'max_length': '1'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['db.Member']"}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True', 'blank': 'True'}),
            'private': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'roomtype': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'start': ('django.db.models.fields.CharField', [], {'default': "u'W'", 'max_length': '1'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['db']