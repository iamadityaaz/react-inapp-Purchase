/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import InAppBilling from 'react-native-billing';

let purchased = false;

class App extends React.Component {
  async componentDidMount() {
    try {
      // make sure the service is close before opening it
      await InAppBilling.close();
      await InAppBilling.open();
      // product with Google Play id: test.buy.onetime

      InAppBilling.listOwnedProducts().then(res => {
        console.log('list of purchased products : ', res);
      });
      InAppBilling.listOwnedSubscriptions().then(res => {
        console.log('list of purchased subscriptions : ', res);
      });
    } catch (error) {
      console.log(error);

      // debug in device with the help of Alert component
    } finally {
      await InAppBilling.close();
    }
  }

  buyGoogleProduct = async id => {
    const response = await new Promise((resolve, reject) => {
      let repurchaseTries = 0;
      const maxRepurchaseTries = 2;
      const buyInAppProduct = async () => {
        try {
          await InAppBilling.close();
          await InAppBilling.open();
          let purchase;
          if (id == 'test.buy.onetime') {
            purchase = await InAppBilling.purchase(id);
            console.log(purchase);
          } else {
            purchase = await InAppBilling.subscribe(id);
            console.log(purchase);
          }

          resolve(purchase);
        } catch (error) {
          console.log(error);
          if (
            error.message === 'Purchase or subscribe failed with error: 102'
          ) {
            if (repurchaseTries >= maxRepurchaseTries) {
              reject(
                new Error(
                  `Failed to purchase ${id} after ${maxRepurchaseTries} retries.`,
                ),
              );
            } else {
              repurchaseTries += 1;
              buyInAppProduct();
            }
          } else if (
            error.message === 'Purchase or subscribe failed with error: 6'
          ) {
            // Communicate to the user that the payment was declined
          } else if (
            error.message === 'Purchase or subscribe failed with error: 1'
          ) {
            // Communicate to the user that the payment was cancelled
          }
        }
      };
      buyInAppProduct();
    });
    let result;
    if (response.purchaseState === 'PurchasedSuccessfully') {
      result = response;
    } else {
      result = Promise.reject(new Error(response.purchaseState));
    }
    return result;
  };

  _showAds = () => {
    alert('Show ads here');
  };

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <View>
            <TouchableOpacity onPress={this._showAds}>
              <Text>Show Ad</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                console.log(this.buyGoogleProduct('test.buy.onetime'));
              }}>
              <Text>Buy one time.</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                console.log(this.buyGoogleProduct('test.subscribe.onemonth'));
              }}>
              <Text>subscribe for 1 month</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                console.log(this.buyGoogleProduct('test.subscribe.yearly'));
              }}>
              <Text>subscribe for 1 year.</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
