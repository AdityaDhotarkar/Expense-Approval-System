import React, { memo, useEffect, useState } from 'react'
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import logo from '../img/BMSLogo.jpg';
import { useSession } from '../firebase/UserProvider';
import { firestore } from '../firebase/config';

// Create styles
const styles = StyleSheet.create({
    page: {
    //   flexDirection: "row",
      backgroundColor: '#ffffff',
      borderTop: '5px solid red'
    },
    section: {
      margin: 10,
      padding: 10,
    //   border: '5px solid red',
      borderColor: '#000000',
      borderWidth : 5,
      borderStyle: 'solid',
      textAlign: 'center',
      backgroundColor: '#ffffff' 
      //flexGrow: 1
    },
    imgStyle : {
        width: 50,
        height: 30,
    },
    headerText: {
        fontSize: 25,
        fontWeight: 'bold'
    },
    subHeaderText: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    smallText: {
        fontSize: 10,
        fontWeight: 'normal'
    },
    smallLeftText: {
        fontSize: 10,
        fontWeight: 'normal',
        textAlign : 'left'
    },
    smallRightText: {
        fontSize: 10,
        fontWeight: 'normal',
        textAlign : 'right'
    },
    normalLeftText: {
        fontSize: 15,
        fontWeight: 'normal',
        textAlign : 'left'
    },
  });
export default memo(function DonationReceipt(props) {
    const [crestAddress] = useState('Flat# B601, Golok Vrindavan, Tilekar Nagar, Behind ISKCON Temple, Kondhwa Pune - 48');
    const [scssAddress] = useState('4, Tarapore Road, Camp, Pune - 01');
    const [crestReg] = useState('MH.894/2015/PUNE');
    const [scsstReg] = useState('MH.894/2015/PUNE');
    const [crestPAN] = useState('AABTC8218M');
    const [scssPAN] = useState('AAKTS9670C');
    const [donationDate, setDonationDate] = useState('');
    const [donationAmountInWord, setDonationAmountInWord] = useState('');
    const [donationBankRefDate, setDonationBankRefDate] = useState('');

    const getMonthInWord = (iMonth) => {
        switch (iMonth) {
            case 0: return 'January';
            case 1: return 'February';
            case 2: return 'March';
            case 3: return 'April';    
            case 4: return 'May';
            case 5: return 'June';
            case 6: return 'July';
            case 7: return 'August';
            case 8: return 'September';
            case 9: return 'October';
            case 10: return 'November';
            case 11: return 'December';
            default:
                break;
        }
    }

    useEffect(() => {
        //Get donation date as string
        const dDate = new Date(props.donation.date);

        let sDate = dDate.getDate();
        let sMonth = getMonthInWord(dDate.getMonth());
        let sYear = dDate.getFullYear();

        setDonationDate('' + sDate + '-' + sMonth + '-' + sYear);

        //Get Bank ref date as string
        let bankRefDate = props.donation.bankRefDate;
        if(bankRefDate !== '' && bankRefDate !== undefined){
            const dBankRefDate = new Date(bankRefDate);
            sDate = dBankRefDate.getDate();
            sMonth = getMonthInWord(dBankRefDate.getMonth());;
            sYear = dBankRefDate.getFullYear();

            setDonationBankRefDate('' +  sDate + '-' + sMonth + '-' + sYear);
        }

        //Get the donation amount wordings
        let num = props.donation.amount;
        var a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
        var b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
        if ((num = num.toString()).length > 9) return 'overflow';
          let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
          if (!n) return; var str = '';
          str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
          str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
          str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
          str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
          str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + '' : '';
          setDonationAmountInWord( str + "only");
    }, [])

    return (
        <Document>
            <Page size="A4" style={styles.page}>
            
            <View style={styles.section}>
                <View style={{alignContent: 'flex-start'}}>
                    {/* <Image src="../public/img/BMS Logo.jpg" /> */}
                    <Image src={logo} alt='BMS Logo'style={styles.imgStyle}/>
                    <Text style={styles.headerText}>{props.donation.trust === 'CREST' ? `Chaitnaya Research & Educational Services Trust` :
                'Sri Chaitanya Shikshan Santha'}</Text>
                    <View>
                        <Text style={styles.smallText}>{props.donation.trust === 'CREST' ? crestAddress : scssAddress}</Text>
                        <Text style={styles.smallText}>Registered under MH act {props.donation.trust === 'CREST' ? crestReg : scsstReg}</Text>
                        <Text style={styles.smallText}>Trust PAN: {props.donation.trust === 'CREST' ? crestPAN : scssPAN}</Text>
                        <Text style={styles.subHeaderText}>RECEIPT</Text>
                        <Text style={styles.smallLeftText}>No: {props.donation.id}</Text>
                        <Text style={styles.smallRightText }>Date: {donationDate}</Text>
                        <Text>
                            Receive with thanks, a sum of Rupees {donationAmountInWord} through {props.donation.mode} {props.donation.mode === 'Cash' ? '' : `with ${props.donation.mode} No: ${props.donation.bankRef} dated ${donationBankRefDate}`} from {props.donor.fullName}
                        </Text>
                        <Text style={styles.normalLeftText }>PAN: {props.donor.pan}</Text>
                        {!!props.donor.phone && <Text style={styles.normalLeftText }>Phone: {props.donor.phone}</Text>}
                        {!!props.donor.email && <Text style={styles.normalLeftText }>Email: {props.donor.email}</Text>}
                        <Text style={styles.normalLeftText }>Address: {props.donor.address.addressLine1}</Text>
                        <Text style={styles.normalLeftText }>{props.donor.address.addressLine2}</Text>
                        <Text style={styles.normalLeftText }>{props.donor.address.city} {props.donor.address.pin}</Text>
                        <Text style={styles.normalLeftText }>{props.donor.address.state} {props.donor.address.country}</Text>
                        <Text>{' '}</Text>
                        <Text style={styles.normalLeftText }> Rs: {props.donation.amount}/-</Text>
                        <Text style={styles.smallRightText }>{'-------------------------------'}</Text>
                        <Text style={styles.smallRightText }>For {props.donation.trust === 'CREST' ? 'Chaitnaya Research & Educational Services Trust' :
                'Sri Chaitanya Shikshan Santha'}</Text>
                    </View>
                </View>
                
            </View>
            <View style={styles.section}>
                <View style={{alignContent: 'flex-start'}}>
                    {/* <Image src="../public/img/BMS Logo.jpg" /> */}
                    <Image src={logo} alt='BMS Logo'style={styles.imgStyle}/>
                    <Text style={styles.headerText}>{props.donation.trust === 'CREST' ? `Chaitnaya Research & Educational Services Trust` :
                'Sri Chaitanya Shikshan Santha'}</Text>
                    <View>
                        <Text style={styles.smallText}>{props.donation.trust === 'CREST' ? crestAddress : scssAddress}</Text>
                        <Text style={styles.smallText}>Registered under MH act {props.donation.trust === 'CREST' ? crestReg : scsstReg}</Text>
                        <Text style={styles.smallText}>Trust PAN: {props.donation.trust === 'CREST' ? crestPAN : scssPAN}</Text>
                        <Text style={styles.subHeaderText}>RECEIPT</Text>
                        <Text style={styles.smallLeftText}>No: {props.donation.id}</Text>
                        <Text style={styles.smallRightText }>Date: {donationDate}</Text>
                        <Text>
                            Receive with thanks, a sum of Rupees {donationAmountInWord} through {props.donation.mode} {props.donation.mode === 'Cash' ? '' : `with ${props.donation.mode} No: ${props.donation.bankRef} dated ${donationBankRefDate}`} from {props.donor.fullName}
                        </Text>
                        <Text style={styles.normalLeftText }>PAN: {props.donor.pan}</Text>
                        {!!props.donor.phone && <Text style={styles.normalLeftText }>Phone: {props.donor.phone}</Text>}
                        {!!props.donor.email && <Text style={styles.normalLeftText }>Email: {props.donor.email}</Text>}
                        <Text style={styles.normalLeftText }>Address: {props.donor.address.addressLine1}</Text>
                        <Text style={styles.normalLeftText }>{props.donor.address.addressLine2}</Text>
                        <Text style={styles.normalLeftText }>{props.donor.address.city} {props.donor.address.pin}</Text>
                        <Text style={styles.normalLeftText }>{props.donor.address.state} {props.donor.address.country}</Text>
                        <Text>{' '}</Text>
                        <Text style={styles.normalLeftText }> Rs: {props.donation.amount}/-</Text>
                        <Text style={styles.smallRightText }>{'-------------------------------'}</Text>
                        <Text style={styles.smallRightText }>For {props.donation.trust === 'CREST' ? 'Chaitnaya Research & Educational Services Trust' :
                'Sri Chaitanya Shikshan Santha'}</Text>
                    </View>
                </View>
                
            </View>
            </Page>
        </Document>
    )
})
