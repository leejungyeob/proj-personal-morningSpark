import React from 'react';
import {View, Text, Button} from 'react-native';

export default function PromptCard({text,onSave,onShare,onNext}){
  return (
    <View style={{padding:20, borderRadius:12, backgroundColor:'#0f1620', margin:12}}>
      <Text style={{color:'#9aa6b2', marginBottom:6}}>오늘의 프롬프트</Text>
      <Text style={{color:'#fff', fontSize:20, marginBottom:10}}>{text}</Text>
      <View style={{flexDirection:'row', justifyContent:'space-between'}}>
        <Button title="Save" onPress={onSave} />
        <Button title="Share" onPress={onShare} />
        <Button title="Next" onPress={onNext} />
      </View>
    </View>
  )
}
