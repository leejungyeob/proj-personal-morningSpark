import React, {useEffect, useState, useRef} from 'react';
import {View, Text, Button, StyleSheet, FlatList, Share, Platform, TouchableOpacity, Modal, Switch} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { AdMobBanner, AdMobInterstitial } from 'expo-ads-admob';

const PROMPTS_KEY = 'savedPrompts';
const NOTIF_KEY = 'notifScheduled';
const NOTIF_TIME_KEY = 'notifTime';

const prompts = require('./prompts.json');

export default function App() {
  const [today, setToday] = useState(getRandomPrompt());
  const [saved, setSaved] = useState([]);
  const [notifScheduled, setNotifScheduled] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [notifOn, setNotifOn] = useState(true);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'

  useEffect(()=>{
    (async ()=>{
      const s = await AsyncStorage.getItem(PROMPTS_KEY);
      if(s) setSaved(JSON.parse(s));
      const ns = await AsyncStorage.getItem(NOTIF_KEY);
      if(ns) setNotifScheduled(true);
      const nt = await AsyncStorage.getItem(NOTIF_TIME_KEY);
      if(nt){
        const parsed = JSON.parse(nt);
        setHour(parsed.hour);
        setMinute(parsed.minute);
      }
      const th = await AsyncStorage.getItem('theme');
      if(th) setTheme(th);
      await registerForPushNotificationsAsync();
      if(!ns){
        await scheduleDailyNotification(hour,minute); // default
        await AsyncStorage.setItem(NOTIF_KEY,'true');
        setNotifScheduled(true);
      }
    })();
  },[]);

  async function savePrompt(){
    const entry = {id: today.id, text: today.text, savedAt: Date.now()};
    const next = [entry,...saved];
    setSaved(next);
    await AsyncStorage.setItem(PROMPTS_KEY, JSON.stringify(next));
  }

  function nextPrompt(){
    setToday(getRandomPrompt());
  }

  async function setAppTheme(t){
    setTheme(t);
    await AsyncStorage.setItem('theme', t);
  }

  async function onShare(){
    try{
      // show interstitial test ad on share
      try{ await AdMobInterstitial.setAdUnitID(Platform.select({ios: 'ca-app-pub-3940256099942544/4411468910', android: 'ca-app-pub-3940256099942544/1033173712'})); await AdMobInterstitial.requestAdAsync({servePersonalizedAds: true}); await AdMobInterstitial.showAdAsync(); }catch(e){console.log('interstitial err',e)}
      await Share.share({message: today.text});
    }catch(e){console.log(e)}
  }

  async function toggleNotif(val){
    setNotifOn(val);
    if(val){
      await scheduleDailyNotification(hour,minute);
      await AsyncStorage.setItem(NOTIF_KEY,'true');
      setNotifScheduled(true);
    }else{
      try{ const ids = await Notifications.getAllScheduledNotificationsAsync(); for(const n of ids){ await Notifications.cancelScheduledNotificationAsync(n.identifier);} }catch(e){}
      await AsyncStorage.removeItem(NOTIF_KEY);
      setNotifScheduled(false);
    }
  }

  async function saveNotifTime(){
    await AsyncStorage.setItem(NOTIF_TIME_KEY, JSON.stringify({hour,minute}));
    if(notifOn) await scheduleDailyNotification(hour,minute);
    setSettingsVisible(false);
  }

  async function testNotificationNow(){
    await Notifications.scheduleNotificationAsync({ content:{ title:'MorningSpark (테스트)', body: getRandomPrompt().text }, trigger: { seconds: 1 } });
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}><Text style={styles.title}>MorningSpark</Text><TouchableOpacity onPress={()=>setSettingsVisible(true)}><Text style={styles.settingsBtn}>Settings</Text></TouchableOpacity></View>
      <View style={styles.card}>
        <Text style={styles.small}>오늘의 프롬프트</Text>
        <Text style={styles.prompt}>{today.text}</Text>
        <View style={styles.row}>
          <Button title="Save" onPress={savePrompt} />
          <Button title="Share" onPress={onShare} />
          <Button title="Next" onPress={nextPrompt} />
        </View>
      </View>

      <Text style={styles.subtitle}>Saved</Text>
      <FlatList data={saved} keyExtractor={i=>i.savedAt.toString()} renderItem={({item})=> (
        <View style={styles.savedItem}><Text style={styles.savedText}>{item.text}</Text></View>
      )} />

      <View style={{marginTop:20}}>
        <AdMobBanner
          bannerSize="smartBanner"
          adUnitID={Platform.select({ios: 'ca-app-pub-3940256099942544/2934735716', android: 'ca-app-pub-3940256099942544/6300978111'})} // test IDs
          servePersonalizedAds // true or false
          onDidFailToReceiveAdWithError={(err)=>console.log('Ad error', err)}
        />
      </View>

      <Modal visible={settingsVisible} animationType="slide">
        <View style={[styles.modalContainer, theme==='light' && styles.modalContainerLight]}>
          <Text style={[styles.modalTitle, theme==='light' && styles.modalTitleLight]}>Settings</Text>
          <View style={styles.rowBetween}><Text style={[styles.modalLabel, theme==='light' && styles.modalLabelLight]}>Daily Reminders</Text><Switch value={notifOn} onValueChange={toggleNotif} /></View>
          <View style={styles.rowBetween}><Text style={[styles.modalLabel, theme==='light' && styles.modalLabelLight]}>Reminder Time</Text><View style={{flexDirection:'row'}}><Button title={`${hour}`} onPress={()=>setHour((hour+1)%24)} /><Text style={{width:10}}/><Button title={`${minute}`} onPress={()=>setMinute((minute+15)%60)} /></View></View>
          <View style={styles.rowBetween}><Text style={[styles.modalLabel, theme==='light' && styles.modalLabelLight]}>Haptic Feedback</Text><Switch value={false} onValueChange={()=>{}} /></View>

          <View style={{height:20}} />
          <Button title="Save" onPress={saveNotifTime} />
          <View style={{height:10}} />
          <Button title="Test notification now" onPress={testNotificationNow} />
          <View style={{height:10}} />

          <View style={{height:20}} />
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
            <View>
              <Text style={[styles.modalLabel, theme==='light' && styles.modalLabelLight]}>Theme</Text>
              <View style={{flexDirection:'row', marginTop:8}}>
                <TouchableOpacity onPress={()=>setAppTheme('light')} style={[styles.themePill, theme==='light' && styles.themePillActive]}><Text style={[styles.themePillText, theme==='light' && styles.themePillTextActive]}>Light</Text></TouchableOpacity>
                <TouchableOpacity onPress={()=>setAppTheme('dark')} style={[styles.themePill, theme==='dark' && styles.themePillActive, {marginLeft:12}]}><Text style={[styles.themePillText, theme==='dark' && styles.themePillTextActive]}>Dark</Text></TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.saveChangesBtn} onPress={async ()=>{ await setAppTheme(theme); setSettingsVisible(false); }}><Text style={styles.saveChangesText}>Save Changes</Text></TouchableOpacity>
          </View>

          <View style={{height:10}} />
          <Button title="Close" onPress={()=>setSettingsVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

function getRandomPrompt(){
  const idx = Math.floor(Math.random()*prompts.length);
  return prompts[idx];
}

async function registerForPushNotificationsAsync() {
  if (!Constants.isDevice) {
    console.log('Must use physical device for notifications');
    return;
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }
}

async function scheduleDailyNotification(hour=9, minute=0){
  // cancel previous daily notifications
  try{
    const ids = await Notifications.getAllScheduledNotificationsAsync();
    for(const n of ids){
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }catch(e){console.log('cancel error',e)}

  // schedule repeating daily by hour/minute via trigger
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'MorningSpark',
      body: getRandomPrompt().text,
      data: {type:'dailyPrompt'}
    },
    trigger: {hour, minute, repeats: true}
  });
}

const styles = StyleSheet.create({
  // dark theme defaults
  container:{flex:1, padding:20, paddingTop:60, backgroundColor:'#0b0f14'},
  headerRow:{flexDirection:'row', justifyContent:'space-between', alignItems:'center'},
  title:{fontSize:24, fontWeight:'700', color:'#fff'},
  settingsBtn:{color:'#9aa6b2', fontSize:16},
  card:{padding:20, borderRadius:12, backgroundColor:'#0f1620', marginBottom:20, elevation:2},
  small:{fontSize:16, color:'#9aa6b2', marginBottom:6},
  prompt:{fontSize:20, color:'#fff', marginBottom:10},
  row:{flexDirection:'row', justifyContent:'space-between'},
  subtitle:{fontSize:18, fontWeight:'600', marginBottom:10, color:'#c4d0da'},
  savedItem:{padding:14, borderRadius:10, backgroundColor:'#0f1620', borderColor:'#1e2a38', borderWidth:1, marginBottom:12},
  savedText:{color:'#e6eef8'},
  modalContainer:{flex:1, padding:20, paddingTop:60, backgroundColor:'#0b0f14'},
  modalTitle:{fontSize:22, fontWeight:'700', color:'#fff', marginBottom:20},
  modalLabel:{color:'#c4d0da', fontSize:16},
  rowBetween:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12},
  timeRow:{flexDirection:'row', alignItems:'center', marginBottom:12},

  // light theme overrides
  modalContainerLight:{backgroundColor:'#f7f8fa'},
  modalTitleLight:{color:'#1f2933'},
  modalLabelLight:{color:'#6b7280'},
  themePill:{paddingVertical:8, paddingHorizontal:14, borderRadius:10, backgroundColor:'#e6eef8'},
  themePillActive:{backgroundColor:'#111827'},
  themePillText:{color:'#111827'},
  themePillTextActive:{color:'#fff'},
  saveChangesBtn:{backgroundColor:'#111827', paddingVertical:14, paddingHorizontal:18, borderRadius:18},
  saveChangesText:{color:'#fff', fontWeight:'700'}
});
