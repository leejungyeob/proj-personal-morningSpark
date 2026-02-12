import React, {useEffect, useState} from 'react';
import {View, Text, Button, StyleSheet, TouchableOpacity, FlatList, Share} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const PROMPTS_KEY = 'savedPrompts';

const prompts = require('./prompts.json');

export default function App() {
  const [today, setToday] = useState(getRandomPrompt());
  const [saved, setSaved] = useState([]);

  useEffect(()=>{
    (async ()=>{
      const s = await AsyncStorage.getItem(PROMPTS_KEY);
      if(s) setSaved(JSON.parse(s));
      await registerForPushNotificationsAsync();
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
    </View>
  );
}

function getRandomPrompt(){
  const idx = Math.floor(Math.random()*prompts.length);
  return prompts[idx];
}

async function registerForPushNotificationsAsync() {
  if (!Constants.isDevice) return;
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

const styles = StyleSheet.create({
  container:{flex:1, padding:20, paddingTop:60},
  title:{fontSize:24, fontWeight:'bold', marginBottom:20},
  card:{padding:20, borderRadius:10, backgroundColor:'#fff', marginBottom:20, elevation:2},
  prompt:{fontSize:18, marginBottom:10},
  row:{flexDirection:'row', justifyContent:'space-between'},
  subtitle:{fontSize:18, fontWeight:'600', marginBottom:10},
  savedItem:{padding:10, borderBottomWidth:1, borderColor:'#eee'}
});
