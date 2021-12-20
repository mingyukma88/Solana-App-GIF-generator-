import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {
  Program, Provider, web3
} from '@project-serum/anchor';

import idl from './idl.json';

// System Program is the reference to Solan Runtime 
const { SystemProgram, Keypair } = web3;

//Create a keypair to hold the solana GIF data 
let baseAccount = Keypair.generate();

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

// All your other Twitter and GIF constants you had.




// Constants
const TWITTER_HANDLE = 'john_ma';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;


const TEST_GIFS = [
  'https://media.giphy.com/media/5C3Zrs5xUg5fHV4Kcf/giphy.gif',
  'https://media.giphy.com/media/trN9ht5RlE3Dcwavg2/giphy.gif',
  'https://media.giphy.com/media/u5OTohqWTzJhunqKN0/giphy.gif',
  'https://media.giphy.com/media/xX6dTAbAj8YkTl42n4/giphy.gif',
  'https://media.giphy.com/media/HWJKLzRBMn4QkE19WR/giphy.gif',
  'https://media.giphy.com/media/5hjafWYNOioM6SD6Tl/giphy.gif'


]

const App = () => {
  /* 
  This function checks if the phantom wallet is connect or not
  */

  //State 
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);


  //Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom Wallet is found!');
          /*
           * The solana object gives us a function that will allow us to connect
           * directly with the user's wallet!
           */
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );

          //set user address as wallet address 
          setWalletAddress(response.publicKey.toString());
        }
      }


      else {
        alert('Solana object not found! Get a Phantom Wallet!  👻 ');
      }
    }
    catch (error) {
      console.error(error);
    }
  };

  /*
     * When our component first mounts, let's check to see if we have a connected
     * Phantom Wallet
     */

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };

    window.addEventListener('load', async (event) => {
      await checkIfWalletIsConnected();
    });
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');

      //call Solana project here 
      const getGifList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Got the account", account)
      setGifList(account.gifList)

      } catch (error) {
       console.log("Error in getGifList: ", error)
       setGifList(null);
     }
    }
      
    useEffect(() => {
   if (walletAddress) {
    console.log('Fetching GIF list...');
    getGifList()
    

    }
  }, [walletAddress]);



  /*
  Let's define the method so our code doesn't break 
  */

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());

    }

  };

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
  const connection = new Connection(network, opts.preflightCommitment);
  const provider = new Provider(
    connection, window.solana, opts.preflightCommitment,
  );
	return provider;
}

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log('Gif link:', inputValue);
      setGifList([...gifList, inputValue]);
      setInputValue('');
    } else {
      console.log('Empty input. Try again.');
    }
  };

  /* render this UI when the user hasn't connected to the app yet 
  */

  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>
      Connect to Wallet
  </button>
  );

  const renderConnectedContainer = () => (
    <div className="connected-container">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendGif();
        }}
      >
        <input type="text" placeholder="Enter gif link!" value={inputValue}
          onChange={onInputChange}
        />

        <button type="submit" className="cta-button submit-gif-button">Submit</button>
      </form>

      <div className="gif-grid">
        {gifList.map(gif => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  );

  //Use Effect 
  useEffect(() => {
    window.addEventListener('load', async (event) => {
      await checkIfWalletIsConnected();
    });
  }, []);




  return (
    <div className="App">
      {/* This was solely added for some styling fanciness */}
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">₿ BTC to the moon baby </p>
          <p className="sub-text">
            Millionaire Gang: HODL Bitcoin, PUMP IT UP, TO THE MOON!! ✨
          </p>
          {/* Add the condition to show this only if we don't have a wallet address */}
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
