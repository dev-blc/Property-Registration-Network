# Property Registration Network

A simple Hyperledger Fabric Network which stores, tracks and records property status and sales. The network constitutes of two main organisations named "Users" & "Registrar".
An Users Org. is user by the end users people to register themselves and their property into the network. The Registrar Org is used to verify, inspect & approve users and their properties.

## Contents 
- [Workflow](#workflow)
- [Pre - Requisites](#pre---requisites)
- [Fabric Network Setup](#fabric-network-setup)
- [Invoke Chaincode Functions](#invoke-chaincode-functions)
  * [User Registration](#user-registration)
  * [Property Registration](#property-registration)
  * [Property Transfer](#property-transfer)
- [Kill Fabric Network](#kill-fabric-network)

## Workflow 
User registration:
 
* A user with permission to access the network raises a request to the registrar to store their data/credentials on the ledger.
* The request gets stored on the ledger. 
* The registrar reads the request and stores the user’s data/credentials on the ledger after validating their identity manually.  
* There is a digital currency called ‘upgradCoins’ associated with each user’s account. All the transactions on this network can be carried out with this currency only. When a user joins the network, they have 0 ‘upgradCoins’.
 
Property registration: 
 
* A user added to the Property Registration System raises a request to the registrar to register their property on the network.
* The request gets stored on the ledger.
* The registrar reads the request and stores the property on the ledger after validating the data present in the request.

Property transfer: 
 
* The owner of the property must put the property on sale.
* The buyer of the property must ensure that the amount of ‘upgradCoins’ they have is greater than or equal to the price of the property. If not, then the user must recharge their account.
* If the two criteria above are satisfied, then the ownership of the property changes from the seller to the buyer and ‘upgradCoins’ equal to the price of the property are transferred from the buyer’s account to the seller’s.


## Pre - Requisites
* Ensure that the Hyperledger Version is 1.4.2. 
* Follow the below steps to install Hyperledger 1.4.2
``` javascript
// Enter the below command to remove all the docker images
 “docker rmi $(docker images -a -q)”
// Enter the below command to install Hyperledger 1.4.2
 “curl -sSL https://bit.ly/2ysbOFE | bash -s -- 1.4.2”
```

* Now to check whether any containers or previous instances are running, run the following commands
``` javascript
// To list down all running docker container 
 “docker ps -a”
// Remove all containers
 “docker rm -f $(docker ps -a -q)”
```

## Fabric Network Setup 
* Navigate into the network folder inside the property-registration folder in your terminal
* Now we can use the fabricNetwork.sh script to do utility functions (like starting the network, installing & instantiating the chain code etc.) in the network
```javascript
// Execute the below command to generate the crypto materials and start the network
 “./fabricNetwork.sh up”
// Lets now Install and Instantiate the chaincode using the below command 
 “./fabricNetwork.sh install”
```

## Invoke Chaincode Functions 
* First let us SSH into peer0’s of users organization and registrar organization respectively in separate terminal windows.
``` javascript
// SSH into peer0 of users organization
 “docker exec it peer0.users.property-registration-network.com /bin/bash”
// SSH into peer0 of registrar organization
 “docker exec it peer0.registrar.property-registration-network.com /bin/bash”
```

### User Registration
* Now lets create two users in the peer0 of users org.
``` javascript
// Invoke requestNewUser function for user Bala
 “peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.userRegnet:requestNewUser","Bala","b@gmail.com","97895
17609","12345678"]}'”

//Invoke requestNewUser function for user Ashik
 “peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.userRegnet:requestNewUser","Ashik","a@gmail.com","9629
929964","123456780"]}'”
```

* Go to peer0 of registrar org to approve the users 
```javascript
// Approve user Bala
 “peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.userRegnet:approveNewUser","Bala","12345678"]}' ” 
// Approve user Ashik
 “peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.userRegnet:approveNewUser","Ashik","123456780"]}' ”
```

* Now to recharge accounts go to peer0 of users org. 
```javascript
//Recharge user Bala
 “peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.userRegnet:rechargeAccount","Bala","12345678","upg1000"]}' ”
// Recharge user Ashik
 “peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.userRegnet:rechargeAccount","Bala","12345678","upg1000"]}' ”
// Invoke the rechargeAccount function couple of times more to get an adequate balance
```

* To view an user’s details at anytime use the below commands at any peers
```javascript
// View user Bala
 “peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.userRegnet:viewUser","Bala","12345678"]}' ” 
// View user Ashik
 “peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.userRegnet:viewUser","Ashik","123456780"]}' ”
```

### Property Registration
* Now lets create a property in the peer0 of users org.
```javascript
// Invoke propertyRegistrationRequest function for user Bala
 “peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.userRegnet:propertyRegistrationRequest","Bala","12345678","P001","2500","registered"]}' ”
```

* Go to peer0 of registrar org to approve the property
```javascript
// Approve property by invoking approveNewProperty
 “peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.userRegnet:approveNewProperty","P001"]}' ”
```

### Property Transfer

* To purchase a property, initiate below transactions in peer0 of users org
* Check the status of the property by using view property and change the status to onSale using upgrdeProperty
```javascript
// View property P001
 “peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.userRegnet:viewProperty","P001"]}'”
// Update property P001
 “peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.userRegnet:updateProperty","P001","Bala","12345678","onSale"]}' "
```

* Invoke purchaseProperty for user Ashik
```javascript
// Purchase property P001 from user Ashik
“peer chaincode invoke -o orderer.property- registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration- network.userRegnet:purchaseProperty","P001","Ashik","12345
6780"]}'”
// Purchase property P001 from user Ashik
```

## Kill Fabric Network
* After using the Fabric network, Kill and bring the property registration network down. 
```javascript
// Use the following command to bring down the network
 “./fabricNetwork.sh up”
```
