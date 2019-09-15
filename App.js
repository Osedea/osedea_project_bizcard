/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component, Fragment } from 'react';
import {
    Animated,
    Image,
    TextInput,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Share from 'react-native-share';
import { Icon } from 'react-native-eva-icons';
import { addOrientationListener, removeOrientationListener } from 'react-native-orientation';
import RNShake from 'react-native-shake';
import SplashScreen from 'react-native-splash-screen';

import Carousel from './components/Carousel';

const slides = [
    {
        icon: 'phone',
        title: 'Phone',
        value: '+1',
        color: '#6CDC61',
        type: 'phone-pad',
    },
    {
        icon: 'twitter',
        title: 'Twitter',
        value: 'https://twitter.com',
        color: '#00acee',
    },
    {
        icon: 'linkedin',
        title: 'LinkedIn',
        value: 'https://linkedin.com/in/',
        color: '#0e76a8',
    },
    {
        icon: 'email',
        title: 'Email',
        value: 'info@osedea.com',
        color: '#CB4A3A',
        type: 'email-address',
    }
];

class App extends Component {
    currentSlide = new Animated.Value(0);

    state = {
        orientation: '',
        slides,
        slidesShown: slides,
        showModal: false,
    };

    slidesDraft = this.state.slides;

    componentDidMount() {
        // In case
        // AsyncStorage.clear();
        AsyncStorage.getItem('@data')
            .then((data) => {
                const slides = JSON.parse(data);

                if (data) {
                    this.setState({
                        slides,
                        slidesShown: slides.filter((item) => item.value !== '')
                    });
                }

                SplashScreen.hide();
            })
            .catch((error) => {
                console.error(error);
                SplashScreen.hide();
            });

        addOrientationListener(this.handleOrientationChange);
        RNShake.addEventListener('ShakeEvent', this.handleShake);
    }

    componentWillUnmount() {
        removeOrientationListener(this.handleOrientationChange);
        RNShake.removeEventListener('ShakeEvent');
    }

    handleShake = () => {
        this.setState({ showModal: true });
    };

    handleOrientationChange = (orientation) => {
        this.setState({ orientation });
    };

    handleSnapTo = (slideIndex)	=> {
        Animated.spring(this.currentSlide, { toValue: slideIndex }).start();
    };

    createButtonPressHandler = (item) => () => {
        if (item === 'share') {
            Share.open({
                message: `Re-bonjour !\nComme convenu, vous pouvez me retrouver sur :${this.state.slidesShown.map((slide) => `\n - ${slide.title}: ${slide.value}`).join('')}`,
                title: 'Restons en contact !',
                subject: 'Restons en contact !',
            })
            .then((res) => {
                console.log(res);
            })
            .catch((err) => { err && console.log(err); });
        } else {
            this.carousel.snapToItem(this.state.slidesShown.indexOf(item));
        }
    }

    createTextChangeHandler = (item) => (text) => {
        const draft = this.slidesDraft.find((draft) => draft.title === item.title);
        draft.value = text;
    }

    handleSaveChangesButton = () => {
        const slides = this.state.slides.map((item, index) => {
            return {
                ...item,
                ...this.slidesDraft[index]
            };
        });

        AsyncStorage.setItem('@data', JSON.stringify(slides))
            .then(() => {
                this.setState({
                    slides,
                    slidesShown: slides.filter((item) => item.value !== ''),
                    showModal: false,
                }, () => {
                    this.slidesDraft = this.state.slides;
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    handleRef = (carousel) => {
        this.carousel = carousel;
    }

    render() {
        const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);
        return (
            <AnimatedSafeAreaView
                style={[
                    styles.container,
                    {
                        backgroundColor: this.currentSlide.interpolate({
                            inputRange: this.state.slidesShown.map((item, index) => index),
                            outputRange: this.state.slidesShown.map((item) => item.color !== '#CB4A3A' ? item.color : '#FFFFFF'),
                        }),
                    }
                ]}
            >
                <Image
                    source={require('./osedea.png')}
                    style={styles.logo}
                />
                <View style={styles.sliderContainer}>
                    <Carousel
                        ref={this.handleRef}
                        slides={this.state.slidesShown}
                        onSnapToItem={this.handleSnapTo}
                        orientation={this.state.orientation}
                    />
                    <View style={styles.buttonsContainer}>
                        {this.state.slidesShown
                            .map((item) => (
                                <TouchableOpacity
                                    key={item.icon}
                                    onPress={this.createButtonPressHandler(item)}
                                    style={styles.buttonContainer}
                                >
                                    <View style={styles.button}>
                                        <Icon
                                            name={item.icon}
                                            width={20}
                                            height={20}
                                            style={styles.icon}
                                        />
                                    </View>
                                </TouchableOpacity>
                            ))
                        }
                        <TouchableOpacity
                            onPress={this.createButtonPressHandler('share')}
                            style={styles.buttonContainer}
                        >
                            <View style={styles.button}>
                                <Icon
                                    name={'share'}
                                    width={20}
                                    height={20}
                                    style={styles.icon}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.showModal}
                    onRequestClose={() => {
                        // Not sure why
                    }}
                >
                    <SafeAreaView style={styles.modalView}>
                        {this.state.slides.map((slide) => (
                            <View key={`text-input-${slide.icon}`}>
                                <Text style={styles.label}>{slide.title}</Text>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={this.createTextChangeHandler(slide)}
                                    defaultValue={slide.value}
                                    keyboardType={slide.type || 'default'}
                                />
                            </View>
                        ))}
                        <TouchableOpacity
                            onPress={this.handleSaveChangesButton}
                            style={[
                                styles.button,
                                styles.modalButton,
                            ]}
                        >
                            <Text>Save and close</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </Modal>
                {__DEV__
                    ? <TouchableOpacity
                    onPress={this.handleShake}
                    style={[
                        styles.button,
                        styles.modalButton,
                    ]}
                >
                    <Text>Open settings</Text>
                </TouchableOpacity>
                : null}
            </AnimatedSafeAreaView>
    );
}
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    sliderContainer: {
        padding: 10,
    },
    buttonsContainer: {
        flexDirection: 'row',
        height: 40,
        marginTop: 20,
        justifyContent: 'space-between',
        marginHorizontal: 10,
    },
    buttonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.3)',
        shadowColor: 'black',
        shadowOffset: {
            width: 2,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 50,
        width: 40,
    },
    logo: {
        width: 150,
        height: 42,
        alignSelf: 'center',
        position: 'absolute',
        top: 100,
    },
    modalButton: {
        width: null,
        position: 'absolute',
        left: 10,
        right: 10,
        bottom: 30,
        padding: 10,
    },
    modalView: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    label: {
        marginLeft: 20,
        fontSize: 18,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        margin: 20,
        padding: 5,
    },
});

export default App;
