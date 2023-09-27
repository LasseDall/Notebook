import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, FlatList, Keyboard, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { collection, doc, setDoc, addDoc, getDocs, deleteDoc, updateDoc, getDoc } from 'firebase/firestore'
import { useCollection } from 'react-firebase-hooks/firestore';
import { db, storage } from './components/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const Stack = createNativeStackNavigator();

const App = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
      <Stack.Screen
          name='Login'
          component={Login}
          options={{ title: 'Login' }}
        />
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
        <Stack.Screen
          name='Page3'
          component={Page3}
          options={{ title: 'Create Account' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const Login = ({ navigation, route }) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>
      <TextInput
        style={styles.textInput}
        onChangeText={(txt) => setUsername(txt)}
        placeholder='Username'
      />
      <TextInput
        style={styles.textInput}
        onChangeText={(txt) => setPassword(txt)}
        placeholder='Password'
      />
    <TouchableOpacity 
    style={ styles.button } 
    title='login' 
    onPress= {async () => {
          try {
            const passwordDB = await getDoc(doc(db, "notes", username));
            if(password == passwordDB.data().key) {
              navigation.navigate("Page1", { username: username })
            } else {
              throw new Error;
            }
          } catch(err) {
            alert("Username or password was wrong");
          }
        Keyboard.dismiss();
      }
    }>
        <Text>LOGIN</Text>
    </TouchableOpacity>
    <TouchableOpacity 
    style={ styles.button } 
    title='createAccount' 
    onPress={ () => {
          navigation.navigate("Page3")
      }}>
        <Text>CREATE NEW ACCOUNT</Text>
    </TouchableOpacity>
    </View>
  );
};

const Page1 = ({ navigation, route }) => {

  const username = route.params?.username;
  const [values, loading, error] = useCollection(collection(db, "notes", username, "notes"));
  const [notes, setNotes] = useState([]); 
  const [newNote, setNewNote] = useState('');
  const data = values?.docs.map((doc => ({...doc.data(), id: doc.id})));

  const updateNote = (key, newNote) => {
    setNotes((prevNotes) => ({
      ...prevNotes,
      [key]: newNote,
    }));
  };

  async function deleteDocument(id) {
    await deleteDoc(doc(db, "notes", username, "notes", id));
  } 

  deleteNote = (key) => {
    setNotes((prevNotes) => {
      const newNotes = { ...prevNotes };
      delete newNotes[key];
      return newNotes;
    });
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate("Page2", { key: item.key, message: item.title, username: username, updateNote: updateNote })
      }>
      <Text style={styles.itemText}>{item.key}</Text>
      <TouchableOpacity style= { styles.deleteButton }
      onPress={ () => deleteDocument(item.id) }>
        <View style={ styles.deleteView }>
        <Text style={ styles.deleteButtonText }>x</Text>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
  onPress={ () => {
    setNotes( async () => {
        try {
          await setDoc(doc(db, "notes", username, "notes", newNote), {
            "key": newNote,
            "title": ''
          })
        } catch(err) {
          console.log(err);
        }
      });
      Keyboard.dismiss();
  }}
/>
</View>
  );
};

const Page2 = ({ navigation, route }) => {
  const message = route.params?.message;
  const key = route.params?.key;
  const username = route.params?.username;
  const updateNote = route.params?.updateNote;
  const [reply, setReply] = useState('');
  const [imagePath, setImagePath] = useState(null);

  useEffect( () => {
    downloadImage();
  }, [])

  async function launchImgePicker() {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true
    });
    if(!result.canceled) {
      await setImagePath(result.assets[0].uri);
    }
  }

  async function launchCamera() {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if(!result) {
      alert("Camera access not provided");
    } else {
      ImagePicker.launchCameraAsync({
        quality: 1
      })
      .then((response) => {
        if(!response.canceled) {
          setImagePath(response.assets[0].uri);
        }
      })
      .catch((error) => {
        alert("Camera failed: " + error);
      });
    }
  }

  async function downloadImage() {
    await getDownloadURL(ref(storage, username + key + ".jpg"))
    .then( (url) => {
      setImagePath(url);
    });
  }

  async function updateNoteFire(id, title) {
    if(title != "") {
      await updateDoc(doc(db, "notes", username, "notes", id), {
        title: title
      });
    }
    const uploadImage = await fetch(imagePath);
    const blob = await uploadImage.blob();
    const storageRef = await ref(storage, username + key + ".jpg");
    uploadBytes(storageRef, blob)
    .then( (snapshot) => {
      console.log("Image uploaded!");
    })
    .catch((error) => console.log("Image failed to upload: " + error));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Note</Text>
      {message && <Text style={styles.noteText}>{message}</Text>}
      <Image style={{ width:200, height:200 }} source={{ uri:imagePath }}/>
      <TextInput
        style={ styles.textInput }
        onChangeText={(txt) => setReply(txt)}
        placeholder='Edit note'
        value={reply}
      />
      <TouchableOpacity style={ styles.button } title='pickImage' onPress={ launchImgePicker }>
        <Text>ADD IMAGE</Text>
      </TouchableOpacity>
      <TouchableOpacity style={ styles.button } title='useCamera' onPress={ launchCamera }>
        <Text>TAKE PICTURE</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={ styles.button }
        title='Save changes'
        onPress={ () => {
          updateNoteFire(key, reply);
          navigation.goBack();
        }}
      >
        <Text>SAVE CHANGES</Text>
      </TouchableOpacity>
    </View>
  );
};

const Page3 = ({ navigation, route }) => {
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  let usernameUsed = false;
  let [showErrorBox, setShowErrorBox] = useState(false);

  async function createNewUser(userN, passW) {
    usernameUsed = false;
    try { 
      const values = await collection(db, "notes");
      const querySnapshot = await getDocs(values);
      querySnapshot.forEach((doc) => {
        if (userN == doc.id) {
          usernameUsed = true;
          throw new Error("Username already used");
        }
      });
    } catch(err) {
      console.log(err.message);
    }
    if(!usernameUsed) {
      try {
          await setDoc(doc(db, "notes", userN), {
            "key": passW,
          });
          await setDoc(doc(db, "notes", userN), { "notes": {} }, { merge: true });
          navigation.navigate("Page1", { username: userN })
      } catch(err) {
          console.log(err);
      }
    } else {
      showErrorBoxFunction();
    }
  };

  const showErrorBoxFunction = () => {
    setShowErrorBox(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>New user</Text>
      <TextInput
        style={ styles.textInput }
        onChangeText={(txt) => setNewUsername(txt)}
        placeholder='Username'
        value={newUsername}
      />
      <TextInput
        style={ styles.textInput }
        onChangeText={(txt) => setNewPassword(txt)}
        placeholder='Password'
        value={newPassword}
      />
      <TouchableOpacity
        style={ styles.button }
        title='createAccount'
        onPress={ () => {
          createNewUser(newUsername, newPassword);
        }}
      >
        <Text>CREATE ACCOUNT</Text>
      </TouchableOpacity>
      {showErrorBox && (
        <View style={{ padding: 10 }}>
          <Text style={{ color: 'red' }}>Username already in use</Text>
        </View>
      )}

    </View>
)};

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
    borderColor: 'black',
  },
  itemText: {
    fontSize: 16,
    width: '96%',
  },
  textInput: {
    backgroundColor: 'white',
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    marginTop: 5,
    marginBottom: 10,
    padding: 5,
    borderRadius: 5,
    border: 'solid',
    textAlign: 'center',
    backgroundColor: '#3498db',
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
    backgroundColor: 'clear',
    borderRadius: 5,
    justifyContent: 'flex-end'
  },
  deleteButtonText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteView: {
    flex: 1,
    alignItems: 'flex-end',
  }
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
