import React from 'react';
import {View, Text, Button, Modal, Switch, TouchableOpacity} from 'react-native';

export default function SettingsModal({visible, onClose, notifOn, toggleNotif, hour, minute, setHour, setMinute, onSaveTheme, theme, setTheme, onTest}){
  return (
    <Modal visible={visible} animationType='slide'>
      <View style={{flex:1, padding:20, paddingTop:60}}>
        <Text style={{fontSize:22, fontWeight:'700'}}>Settings</Text>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:20}}>
          <Text>Daily Reminders</Text>
          <Switch value={notifOn} onValueChange={toggleNotif} />
        </View>
        <View style={{marginTop:12}}>
          <Text>Reminder Time</Text>
          <View style={{flexDirection:'row', marginTop:8}}>
            <Button title={`${hour}`} onPress={()=>setHour((hour+1)%24)} />
            <View style={{width:12}} />
            <Button title={`${minute}`} onPress={()=>setMinute((minute+15)%60)} />
          </View>
        </View>
        <View style={{marginTop:20}}>
          <Text>Theme</Text>
          <View style={{flexDirection:'row', marginTop:8}}>
            <TouchableOpacity onPress={()=>onSaveTheme('light')} style={{padding:8, backgroundColor: theme==='light' ? '#111' : '#eee'}}><Text>Light</Text></TouchableOpacity>
            <View style={{width:8}}/>
            <TouchableOpacity onPress={()=>onSaveTheme('dark')} style={{padding:8, backgroundColor: theme==='dark' ? '#111' : '#eee'}}><Text>Dark</Text></TouchableOpacity>
          </View>
        </View>

        <View style={{marginTop:20}}>
          <Button title="Test notification now" onPress={onTest} />
        </View>

        <View style={{marginTop:20}}>
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  )
}
