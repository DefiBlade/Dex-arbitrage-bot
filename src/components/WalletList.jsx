import React, {Component, useState} from 'react';
import { InputGroup, FormControl, Button, Modal} from 'react-bootstrap';
import { MDBDataTableV5 } from 'mdbreact';
import { database } from './firebase/firebase';
import { addressdatabaseurl, web3url } from './config';
import { erc20abi } from './abi';
import Web3 from 'web3';
const web3        = new Web3(new Web3.providers.HttpProvider(web3url));

class WalletList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            prevAddress : '',
            newAddress : '',
            editKey: '',
            walletLists : [],
            show : false,
        }

        this.closeModal = e =>{
          this.setState({
            show: false
          });
        }
    }

    async componentWillMount() {
      await this.Init()
    }

    Init(){
        database.ref(addressdatabaseurl + '/').get().then((snapshot) => {
            if (snapshot.exists) {
              var walletList = [];
                const newArray = snapshot.val();
                if (newArray) {
                    Object.keys(newArray).map( (key, index) => {
                        const value = newArray[key];
                        walletList.push({
                            id: index+1,
                            key,
                            Address : value.Address,
                            tokenName : value.tokenName,
                        })
                    })
                }
                this.setState({
                walletLists : walletList
              })
            }
        });
    }

    onReload = () => {
      this.Init()
    }

    closeModal(){
      console.log("close")
    }

    deleteWalletList(id){
      console.log(id)
      database.ref(addressdatabaseurl + '/' + id).remove();
      this.Init(); 
    }

    saveWallet(){

        if(this.state.newAddress==''){
          alert("input date")
          return
        }

        const load = {
          Address : this.state.newAddress,
          Label : this.state.newLabel
        }
        var updates = {}
        updates[addressdatabaseurl + '/'+ this.state.editKey] = load;
        database.ref().update(updates).then(function(){
          alert("Data saved successfully.");
        }).catch(function(error) {
          alert("Data could not be saved." + error);
        });;
        this.setState({
          show : false
        })
        this.Init();
    }

    render () {
      const rows = this.state.walletLists.map((walletList) => {
        walletList.Actions =  <div>
                                   <Button variant="outline-danger"  size = "sm" onClick= {()=>this.deleteWalletList(walletList.key)}> Delete</Button>{' '}
                              </div>
        return walletList
      })
          const data = {
            columns: [
              {
                label: 'No',
                field: 'id',
                sort: 'asc',
                width: 150
              },
              {
                label: 'Token Symbol',
                field: 'tokenName',
                sort: 'asc',
                width: 200
              },
              {
                label: 'Token Address',
                field: 'Address',
                sort: 'asc',
                width: 270
              },
              {
                label: 'Delete',
                field: 'Actions',
                sort: 'asc',
                width: 100
              }
            ],
            rows : rows
          };
        return (
            <div>
                <h2>Token List</h2>
                <hr/><br/><br/>
                <Example onReload={this.onReload} walletData = {this.state.walletLists}/>
                <br/><br/>
                <MDBDataTableV5 hover entriesOptions={[10,20,50,100,200,500,1000]} entries={50} pagesAmount={10} data={data} materialSearch/><br/><br/>
            </div>
        );
    }
  }
export default WalletList;

function Example(props) {
  var  addAddress = ''
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow  =  () => setShow(true);

  const addwallet   =   async () =>{
    setShow(false)
    if(addAddress === ""){
      alert("Please check Address")
      return
    }
    else {
      addAddress = await web3.utils.toChecksumAddress(addAddress)
      try{
        let tokenContract= new web3.eth.Contract(erc20abi, await web3.utils.toChecksumAddress(addAddress));
        let tokenName    = await tokenContract.methods.symbol().call().then(function(res) {  return res;  })
        const walletList= {
        Address : addAddress,
        tokenName : tokenName
        }
        var userListRef = database.ref(addressdatabaseurl)
        var newUserRef = userListRef.push();
        newUserRef.set(walletList);
        props.onReload();
        }
        catch(err){
          alert("please check token address.")
          addAddress = ''
        }
    }
  }


  const handleAddress = async (e) => {
    addAddress  = e.target.value
  }
  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Add Token
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Token Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon3">
            Address
          </InputGroup.Text>
          <FormControl id="basic-url1" aria-describedby="basic-addon3"  type="text" 
          placeholder="0x" defaultValue={addAddress} onChange={handleAddress} />
        </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary"   onClick={addwallet}>
            Add token
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}



