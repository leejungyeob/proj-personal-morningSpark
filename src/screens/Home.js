import React from 'react';
import {View, Text, Button, FlatList} from 'react-native';
import PromptCard from '../components/PromptCard';

export default function Home({today, saved, onSave, onShare, onNext}){
  return (
    <View style={{flex:1}}>
      <PromptCard text={today.text} onSave={onSave} onShare={onShare} onNext={onNext} />
      <Text style={{fontSize:18, fontWeight:'600', margin:12}}>Saved</Text>
      <FlatList data={saved} keyExtractor={i=>i.savedAt.toString()} renderItem={({item})=> (
        <View style={{padding:12,borderBottomWidth:1,borderColor:'#eee'}}><Text>{item.text}</Text></View>
      )} />
    </View>
  );
}
