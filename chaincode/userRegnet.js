'use strict'

const {Contract} = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;

class userRegnet extends Contract {
	
	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.property-registration-network.userRegnet');
	}
	
	//Instantiate function
	async instantiate(ctx) {
		console.log('*USER_ONLY_ACCESS* ********** userRegnet Chaincode Instantiated ********** *USER_ONLY_ACCESS*');
	}

	// /**
	// * @function checkOrg 
	// * @decription This fucntion is used by the other functions in the smart contract to validate the transaction initiator.
	// * 
	// * @param ctx
	// * 
	// * @returns True/False  
	// **/
	// let checkOrg = (ctx) => {
	// 	const cid = new ClientIdentity(stub);
	// 	const userCert = cid.getX509Certificate();
	// 	if(userCert.issuer.organizationName === "users.property-registration-network.com"){
	// 		return true;
	// 	}
	// 	else{
	// 		return false;
	// 	}
	// }

	/**
	* @function requestNewUser 
	* @decription This transaction is called by the user to request the registrar to register them on the property-registration-network.
	* 
	* @param ctx
	* @param name - Name of the user 
	* @param emailID - Email Id of the user
	* @param phoneNumber - Phone number of the user 
	* @param aadhar - Aadhar number of the user
	* 
	* @returns newRequest - A request object 
	**/
	async requestNewUser(ctx, name, emailID, phoneNumber, aadhar){
		const cid = new ClientIdentity(ctx.stub);
		const userCert = cid.getX509Certificate();
		if(userCert.issuer.organizationName === "users.property-registration-network.com"){
			//Create a composite key
			const requestKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.request',[name+'_'+aadhar]);
			let requestBuffer = await ctx.stub.getState(requestKey).catch(err => console.log(err));
			
			//Verify if request already exists
			if(requestBuffer.length === 0){
				//Create a request object
				let newRequest = {
					name: name,
					email: emailID,
					phone: phoneNumber,
					aadhar: aadhar,
					createdAt: new Date(),
				};
				let dataBuffer = Buffer.from(JSON.stringify(newRequest));
				await ctx.stub.putState(requestKey, dataBuffer);
				return newRequest;
			}
			else{
				throw new Error('Request already exists!!'); 
			}
		}
		else{
			throw new Error('*********** USER_ONLY_ACCESS ***********');
		}
	}

	/**
	* @function rechargeAccount 
	* @decription This transaction is initiated by the user to recharge their account with ‘upgradCoins’
	* 
	* @param ctx
	* @param name - Name of the user
	* @param aadhar - Aadhar number of the user
	* @param txID - Transaction Id validating the money transfer for upgrad coins
	*
	**/
	async rechargeAccount(ctx, name, aadhar, txID){
		const cid = new ClientIdentity(ctx.stub);
		const userCert = cid.getX509Certificate();
		if(userCert.issuer.organizationName === "users.property-registration-network.com"){
			// Create a user key
			const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user',[name+'_'+aadhar]);
			
			// Fetch User from Ledger
			let userBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));
			let user = JSON.parse(userBuffer.toString());
			if(userBuffer.length !== 0){
				//Verify Transaction id	
				if (txID === "upg100") {user.upgradCoins = user.upgradCoins + 100;}
				else if (txID ==="upg500") {user.upgradCoins = user.upgradCoins + 500;}
				else if (txID ==="upg1000") {user.upgradCoins = user.upgradCoins + 1000;}
				else {  throw new Error('Invalid Bank Transaction ID'); }
				let dataBuffer = Buffer.from(JSON.stringify(user));
				await ctx.stub.putState(userKey, dataBuffer);
				//return user.upgradCoins;
			}
			else{
				throw new Error('Only registered user can recharge account');
			}
		}
		else{
			throw new Error('*********** USER_ONLY_ACCESS ***********');
		}
	}

	/**
	* @function viewUser 
	* @decription This transaction is initiated by the user to view their account status & details
	* 
	* @param ctx
	* @param name - Name of the user
	* @param aadhar - Aadhar number of the user
	*
	* @returns User object
	**/
	async viewUser(ctx, name, aadhar){
		// Fetch User from Ledger
		const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user',[name+'_'+aadhar]);
		let userBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));
		let user = JSON.parse(userBuffer.toString());
		
		//Check if user exists 
		if(userBuffer.length !== 0){
			return user;
		}
		else{
			throw new Error('User not found!! Check user details');
		}
	}

	/**
	* @function propertyRegistrationRequest 
	* @decription This transaction is initiated by the user to register their property into the network
	* 
	* @param ctx
	* @param name - Name of the user
	* @param aadhar - Aadhar number of the user
	* @param propertyID - ID of the property to be registered
	* @param price - Price of the property
	* @param status - Status of the property (Either 'onSale' or 'registered')
	*
	* @returns propertyRequest object
	**/
	async propertyRegistrationRequest(ctx, name, aadhar, propertyID, price, status){
		const cid = new ClientIdentity(ctx.stub);
		const userCert = cid.getX509Certificate();
		if(userCert.issuer.organizationName === "users.property-registration-network.com"){
			const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user',[name+'_'+aadhar]);
			let userBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));
			let user = JSON.parse(userBuffer.toString());
		
			//Create a composite key
			const registerRequestKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.registerRequest',[propertyID]);
			let registerRequestBuffer = await ctx.stub.getState(registerRequestKey).catch(err => console.log(err));
			if(status !== "registered" && status !== "onSale"){	throw new Error('Status error - pass either #registered# or #onSale#');}
		
			//Verify request
			if(userBuffer.length !== 0 || registerRequestBuffer.length ===0 ){

				//Create a register request object
				let newRegisterRequest = {
					propertyID: propertyID,
					owner: userKey,
					price: price,
					status: status,
					createdAt: new Date(),
				};
				let dataBuffer = Buffer.from(JSON.stringify(newRegisterRequest));
				await ctx.stub.putState(registerRequestKey, dataBuffer);
				return newRegisterRequest;
			}
			else{
				throw new Error('Only registered user can raise a property request OR Request already exists'); 
			}
		}
		else{
			throw new Error('*********** USER_ONLY_ACCESS ***********');
		}
	}

	/**
	* @function viewProperty
	* @decription This transaction is initiated by the user to view any property
	* 
	* @param ctx
	* @param propertyID - ID of the property to be registered
	* @param owner - User Key of the owner
	* 
	* @returns Property object
	**/
	async viewProperty(ctx, propertyID){
		// Create property key
		const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property',[propertyID]);
		
		// Fetch property from Ledger
		let propertyBuffer = await ctx.stub.getState(propertyKey).catch(err => console.log(err));
		let property = JSON.parse(propertyBuffer.toString());
		
		//Check if property exists 
		if(propertyBuffer.length !== 0){
			return property;
		}
		else{
			throw new Error('property not found!! Check property details');
		}
	}
	
	/**
	* @function updateProperty
	* @decription This transaction is initiated by the user to update their property status
	* 
	* @param ctx
	* @param propertyID - ID of the property to be registered
	* @param name - Name of the user
	* @param aadhar - Aadhar number of the user
	* @param status - Status of the property (Either 'onSale' or 'registered')
	*
	**/
	async updateProperty(ctx,propertyID, name, aadhar, status){
		const cid = new ClientIdentity(ctx.stub);
		const userCert = cid.getX509Certificate();
		if(userCert.issuer.organizationName === "users.property-registration-network.com"){
			//Create composite keys
			const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user',[name+'_'+aadhar]);
			const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property',[propertyID]);

			// Fetch property from Ledger
			let propertyBuffer = await ctx.stub.getState(propertyKey).catch(err => console.log(err));
			let property = JSON.parse(propertyBuffer.toString());
			let userBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));

			if(propertyBuffer.length !== 0 && userBuffer.length !== 0){
				//Verify owner
				if(property.owner === userKey){
					if(status != "registered" && status != "onSale"){ throw new Error('Status error - pass either #registered# or #onSale#');}
					else {	property.status = status;
							let dataBuffer = Buffer.from(JSON.stringify(property));
							await ctx.stub.putState(propertyKey, dataBuffer);
					}
				}
				else{
					throw new Error('Property not owned by '+ name + ' !! Only owner can update property');
				} 
			}
			else{
				throw new Error('Property not found!! Check property details OR User doesnt exist!! Check user details');
			}
		}
		else{
			throw new Error('*********** USER_ONLY_ACCESS ***********');
		}
	}

	/**
	* @function purchaseProperty
	* @decription This transaction is initiated by the user to purchase any property listed on the network
	* 
	* @param ctx
	* @param propertyID - ID of the property to be registered
	* @param name - Name of the user
	* @param aadhar - Aadhar number of the user
	*
	**/
	async purchaseProperty(ctx,propertyID, name, aadhar) {
		const cid = new ClientIdentity(ctx.stub);
		const userCert = cid.getX509Certificate();
		if(userCert.issuer.organizationName === "users.property-registration-network.com"){
			const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user',[name+'_'+aadhar]);
			const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property',[propertyID]);
			
			// Fetch property from Ledger
			let propertyBuffer = await ctx.stub.getState(propertyKey).catch(err => console.log(err));
			let property = JSON.parse(propertyBuffer.toString());
			let userBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));
			let user = JSON.parse(userBuffer.toString());
			let sellerKey = property.owner;
			let sellerBuffer = await ctx.stub.getState(property.owner).catch(err => console.log(err));
			let seller = JSON.parse(sellerBuffer.toString());

			if(propertyBuffer.length !== 0 && userBuffer.length !== 0 && sellerBuffer.length !==0){
				//Check sale status 
				if(property.status === 'onSale'){
					if(user.upgradCoins >= property.price){
						user.upgradCoins = user.upgradCoins - property.price;
						seller.upgradCoins = parseInt(seller.upgradCoins) + parseInt(property.price);
						property.owner = userKey;
						property.status = "registered";
						let propertyDataBuffer = Buffer.from(JSON.stringify(property));
						await ctx.stub.putState(propertyKey, propertyDataBuffer);
						let userDataBuffer = Buffer.from(JSON.stringify(user));
						await ctx.stub.putState(userKey, userDataBuffer);
						let sellerDataBuffer = Buffer.from(JSON.stringify(seller));
						await ctx.stub.putState(sellerKey, sellerDataBuffer);

					}
					else{
						throw new Error('Not enough balance!! Need ' + (property.price - user.upgradCoins) + 'upgradCoins to purchase property' );
					}
				}
				else{
					throw new Error('Property not on sale!! ');
				} 
			}
			else{
				throw new Error('Property not found!! Check property details OR User doesnt exist!! Check user details');
			}
		}
		else{
			throw new Error('*********** USER_ONLY_ACCESS ***********');
		}
	}
}


module.exports = userRegnet;















