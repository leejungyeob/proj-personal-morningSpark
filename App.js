import React, {useEffect, useState, useRef} from 'react';
import {View, Text, Button, StyleSheet, FlatList, Share, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { AdMobBanner } from 'expo-ads-admob';

const PROMPTS_KEY = 'savedPrompts';
const NOTIF_KEY = 'notifScheduled';

const prompts = require('./prompts.json');

export default function App() {
  const [today, setToday] = useState(getRandomPrompt());
  const [saved, setSaved] = useState([]);
  const [notifScheduled, setNotifScheduled] = useState(false);

  useEffect(()=>{
    (async ()=>{
      const s = await AsyncStorage.getItem(PROMPTS_KEY);
      if(s) setSaved(JSON.parse(s));
      const ns = await AsyncStorage.getItem(NOTIF_KEY);
      if(ns) setNotifScheduled(true);
      await registerForPushNotificationsAsync();
      if(!ns){
        await scheduleDailyNotification(9,0); // default 09:00
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

  async function onShare(){
    try{
      await Share.share({message: today.text});
    }catch(e){console.log(e)}
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MorningSpark</Text>
      <View style={styles.card}>
        <Text style={styles.prompt}>{today.text}</Text>
        <View style={styles.row}>
          <Button title="Save" onPress={savePrompt} />
          <Button title="Share" onPress={onShare} />
          <Button title="Next" onPress={nextPrompt} />
        </View>
      </View>

      <Text style={styles.subtitle}>Saved</Text>
      <FlatList data={saved} keyExtractor={i=>i.savedAt.toString()} renderItem={({item})=> (
        <View style={styles.savedItem}><Text>{item.text}</Text></View>
      )} />

      <View style={{marginTop:20}}>
        <AdMobBanner
          bannerSize="smartBanner"
          adUnitID={Platform.select({ios: 'ca-app-pub-3940256099942544/2934735716', android: 'ca-app-pub-3940256099942544/6300978111'})} // test IDs
          servePersonalizedAds // true or false
          onDidFailToReceiveAdWithError={(err)=>console.log('Ad error', err)}
        />
      </View>
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

  const trigger = new Date();
  trigger.setHours(hour);
  trigger.setMinutes(minute);
  trigger.setSeconds(0);
  // if time already passed today, schedule for tomorrow
  if(trigger <= new Date()) trigger.setDate(trigger.getDate()+1);

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
  container:{flex:1, padding:20, paddingTop:60},
  title:{fontSize:24, fontWeight:'bold', marginBottom:20},
  card:{padding:20, borderRadius:10, backgroundColor:'#fff', marginBottom:20, elevation:2},
  prompt:{fontSize:18, marginBottom:10},
  row:{flexDirection:'row', justifyContent:'space-between'},
  subtitle:{fontSize:18, fontWeight:'600', marginBottom:10},
  savedItem:{padding:10, borderBottomWidth:1, borderColor:'#eee'}
});
