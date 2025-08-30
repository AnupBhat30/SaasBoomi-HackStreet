import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const index = () => {
  return (
    <View>
      <Text style={styles.text}>recipe</Text>
    </View>
  )
}
const styles=StyleSheet.create({
  text:{
    color:"white",
  }
})
export default index