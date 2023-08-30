import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, FlatList, Keyboard } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Page1'>
        <Stack.Screen
          name='Page1'
          component={Page1}
          options={{ title: 'Notes App' }}
        />
        <Stack.Screen
          name='Page2'
          component={Page2}
          options={{ title: 'Edit Note' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const Page1 = ({ navigation, route }) => {
  const messageBack = route.params?.messageBack;

  const [notes, setNotes] = useState({
    note1: 'Note to self',
    note2: 'Husk møde (Dont be late)',
  });

  const data = Object.keys(notes).map((key) => ({
    key: key,
    title: notes[key],
  }));

  const updateNote = (key, newNote) => {
    setNotes((prevNotes) => ({
      ...prevNotes,
      [key]: newNote,
    }));
  };

  const deleteNote = (key) => {
    setNotes((prevNotes) => {
      const newNotes = { ...prevNotes };
      delete newNotes[key];
      return newNotes;
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate("Page2", { key: item.key, message: item.title, updateNote: updateNote })
      }>
      <Text style={styles.itemText}>{item.key}</Text>
      <TouchableOpacity style= { styles.deleteButton }
      onPress={ () => deleteNote(item.key) }>
        <Text style= { styles.deleteButtonText }>x</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const [newNote, setNewNote] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Notes</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
      />
      <TextInput
        style={styles.textInput}
        onChangeText={(txt) => setNewNote(txt)}
        placeholder='New note'
      />
      <Button
        title='Add note'
        onPress={() => {
          setNotes((notes) => ({
            ...notes,
            [`note${Object.keys(notes).length + 1}`]: newNote,
          }));
          setNewNote('');
          Keyboard.dismiss();
        }}
      />
      {messageBack && <Text style={styles.replyText}>Reply from Page 2: {messageBack}</Text>}
    </View>
  );
};

const Page2 = ({ navigation, route }) => {
  const message = route.params?.message;
  const key = route.params?.key;
  const updateNote = route.params?.updateNote;
  const [reply, setReply] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Note</Text>
      {message && <Text style={styles.noteText}>{message}</Text>}
      <TextInput
        style={styles.textInput}
        onChangeText={(txt) => setReply(txt)}
        placeholder='Edit note'
        value={reply}
      />
      <Button
        title='Save changes'
        onPress={() => {
          updateNote(key, reply);
          navigation.goBack();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
  },
  textInput: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  replyText: {
    marginTop: 10,
    fontSize: 16,
    color: 'green',
  },
  noteText: {
    fontSize: 16,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 290
  },
  deleteButtonText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default App;
/*
const [text, setText] = useState("")

const [notes, setNotes] = useState([])

function addBtnPressed() {
  setNotes([...notes, text])
  console.log(notes)
  return (
    <View style={styles.container}>
      <TextInput placeholder='Ny note' onChangeText={(txt)=>setText(txt)}></TextInput>
      
      <Button title='Add' onPress={addBtnPressed}></Button>
      <StatusBar style="auto" />
    </View>
  );
}
*/
