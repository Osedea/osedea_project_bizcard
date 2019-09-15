import React, { Component } from 'react';
import { Dimensions, Text, StyleSheet, View } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import QRCode from 'react-native-qrcode-svg';
import { Icon } from 'react-native-eva-icons';

const styles = StyleSheet.create({
    slide: {
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
        padding: 20,
        borderRadius: 4,
        marginBottom: 20,
        marginHorizontal: 5,
    },
    icon: {
        marginBottom: 10,
    },
    text: {
        marginTop: 10,
    }
});

const businessCardRatio = 55 / 85;

export class MyCarousel extends React.PureComponent {
    handleRef = (c) => {
        this.carousel = c;
    };

    renderItem = (itemWidth) => ({item, index}) => {
        return (
            <View
                style={[
                    styles.slide,
                    { height: businessCardRatio * itemWidth }
                ]}
            >
                <Icon
                    name={item.icon}
                    width={20}
                    height={20}
                    style={styles.icon}
                    fill={item.color}
                />
                <QRCode
                    value={item.value}
                    size={120}
                />
                <Text style={styles.text}>{item.value}</Text>
            </View>
        );
    }

    snapToItem = (...props) => {
        this.carousel.snapToItem(...props);
    }

    render() {
        const { width, height } = Dimensions.get('window');
        const sliderWidth = width - 20;
        const itemWidth = Math.min(width - 30, (height - 150) * 85 / 55);

        return (
            <Carousel
                ref={this.handleRef}
                layout={'default'}
                data={this.props.slides}
                renderItem={this.renderItem(itemWidth)}
                sliderWidth={sliderWidth}
                itemWidth={itemWidth}
                onSnapToItem={this.props.onSnapToItem}
            />
        );
    }
}

export default MyCarousel;
