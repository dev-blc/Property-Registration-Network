'use strict'

const {Contract} = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;

class registrarRegnet extends Contract {
	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.property-registration-network.registrarRegnet');
	}
	
	//Instantiate function
	async instantiate(ctx) {
		console.log('*REGISTRAR_ONLY_ACCESS* ********** registrarRegnet Chaincode Instantiated ********** *REGISTRAR_ONLY_ACCESS*');
	}

	// /**
	// * @function checkOrg 
	// * @decription This fucntion is used by the other functions in the smart contract to validate the transaction initiator.
	// * 
	// * @param ctx
	// * 
	// * @returns User/err message  
	// **/
	// let checkOrg = (ctx) => {
	// 	const cid = new ClientIdentity(ctx.stub);
	// 	const userCert = cid.getX509Certificate();
	// 	if(userCert.issuer.organizationName === "registrar.property-registration-network.com"){
	// 		return true;
	// 	}
	// 	else{
	// 		return false;
	// 	}
	// }

	/**
	* @function approveNewUser 
	* @decription This transaction is initiated by the registrar to approve a newUserRequest 
	*  
	* @param ctx
	* @param name - Name of the user
	* @param aadhar - Aadhar number of the user
	*
	* @returns User object
	**/
	async approveNewUser(ctx, name, aadhar){
		const cid = new ClientIdentity(ctx.stub);
		const userCert = cid.getX509Certificate();
		if(userCert.issuer.organizationName === "registrar.property-registration-network.com"){
			const requestKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.request',[name+'_'+aadhar]);
			const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user',[name+'_'+aadhar]);
			
			//Fetch request from ledger 
			let requestBuffer = await ctx.stub.getState(requestKey).catch(err => console.log(err));
			let request = JSON.parse(requestBuffer.toString());
			let userBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));

			//Check validity of request and verify that the user doesnt exist 
			if(requestBuffer.length === 0 || userBuffer.length !== 0){
				throw new Error('Invalid Request key '+ requestKey +' for user '+ name +'!! Either request doesnt exist OR User already exists');
			}
			else {
				//New User Object
				let newUser = {
					name: name,
					email: request.emailID,
					phone: request.phoneNumber,
					aadhar: aadhar,
					upgradCoins: 0,
					requestCreatedAt: request.createdAt,
					userCreatedAt: new Date(),
				};
				let dataBuffer = Buffer.from(JSON.stringify(newUser));
				await ctx.stub.putState(userKey, dataBuffer);
				return newUser;
			}
		}
		else{
			throw new Error('*********** REGISTRAR_ONLY_ACCESS ***********');
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
			throw new Error('User not found!! Check user details ');
		}
	}

	/**
	* @function approveNewProperty 
	* @decription This transaction is initiated by the registrar to approve a new property to be registered in the network 
	*  
	* @param ctx
	* @param name - Name of the user
	* @param aadhar - Aadhar number of the user
	*
	* @returns User object
	**/
	async approveNewProperty(ctx, propertyID){
		const cid = new ClientIdentity(ctx.stub);
		const userCert = cid.getX509Certificate();
		if(userCert.issuer.organizationName === "registrar.property-registration-network.com"){
			//Create a composite key
			const registerRequestKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.registerRequest',[propertyID]);			

			//Fetch register request from ledger 
			let registerRequestBuffer = await ctx.stub.getState(registerRequestKey).catch(err => console.log(err));
			let registerRequest = JSON.parse(registerRequestBuffer.toString());
			
			//Create a property key
			const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property',[propertyID]);
			let propertyBuffer = await ctx.stub.getState(propertyKey).catch(err => console.log(err));
			
			//Check validity of request and verify that the user doesnt exist 
			if(registerRequestBuffer.length === 0 && propertyBuffer.length !== 0){
				throw new Error('Invalid register Request key '+ requestKey +' for property '+ name +'!! Either request doesnt exist OR property already exists');
			}
			else {
				//New property Object
				let newProperty = {
					propertyID: registerRequest.propertyID,
					owner: registerRequest.owner,
					price: registerRequest.price,
					status: registerRequest.status,
					registerRequestCreatedAt: registerRequest.createdAt,
					propertyCreatedAt: new Date(),
				};
				let dataBuffer = Buffer.from(JSON.stringify(newProperty));
				await ctx.stub.putState(propertyKey, dataBuffer);
				return newProperty;
			}
		}
		else{
			throw new Error('*********** REGISTRAR_ONLY_ACCESS ***********'); 
		}
	}

	/**
	* @function viewProperty
	* @decription This transaction is initiated by the user to view their property status & details
	* 
	* @param ctx
	* @param propertyID - Property id of the property to be viewed
	* @param name - Name of the user
	* @param aadhar - Aadhar number of the user
	*
	* @returns User object
	**/
	async viewProperty(ctx, propertyID){
		//Create a composite key
		const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property',[propertyID]);
		
		// Fetch property from Ledger
		let propertyBuffer = await ctx.stub.getState(propertyKey).catch(err => console.log(err));
		let property = JSON.parse(propertyBuffer.toString());
		
		//Check if property exists 
		if(propertyBuffer.length !== 0){
			return property;
		}
		else{
			throw new Error('Property not found!! Check property details');
		}
	}
}

module.exports = registrarRegnet;




