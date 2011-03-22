package org.innobuilt.fincayra.fps;
/******************************************************************************* 
 *  Copyright 2008-2010 Amazon Technologies, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License"); 
 *  
 *  You may not use this file except in compliance with the License. 
 *  You may obtain a copy of the License at: http://aws.amazon.com/apache2.0
 *  This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
 *  CONDITIONS OF ANY KIND, either express or implied. See the License for the 
 *  specific language governing permissions and limitations under the License.
 * ***************************************************************************** 
 */

import java.net.URI;
import java.security.SignatureException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public class ButtonGenerator {
	public static final String ASPHttpMethod = "POST";
	public static final String CBUIHttpMethod = "GET";
	public static final String CBUI_REQUEST_URI = "/cobranded-ui/actions/start";
	public static final String SANDBOX_END_POINT = "https://authorize.payments-sandbox.amazon.com/pba/paypipeline";
	public static final String SANDBOX_IMAGE_LOCATION = "https://authorize.payments-sandbox.amazon.com/pba/images/payNowButton.png";
	public static final String SANDBOX_MP_IMAGE_LOCATION = "https://authorize.payments-sandbox.amazon.com/pba/images/MarketPlaceFeeWithLogo.png";
	public static final String PROD_END_POINT = "https://authorize.payments.amazon.com/pba/paypipeline";
	public static final String PROD_IMAGE_LOCATION = "https://authorize.payments.amazon.com/pba/images/payNowButton.png";
	public static final String PROD_MP_IMAGE_LOCATION = "https://authorize.payments.amazon.com/pba/images/MarketPlaceFeeWithLogo.png";
	public static final String HMAC_SHA1_ALGORITHM = "HmacSHA1";
	public static final String HMAC_SHA256_ALGORITHM = "HmacSHA256";
	public static final String SIGNATURE_KEYNAME = "signature";
	public static final String SIGNATURE_METHOD_KEYNAME = "signatureMethod";
	public static final String SIGNATURE_VERSION_KEYNAME = "signatureVersion";
	public static final String SIGNATURE_VERSION = "2";
	public static final String COBRANDING_STYLE = "logo";
	/**
	 * Function creates a Map of key-value pairs for all valid values passed to
	 * the function
	 * 
	 * @param accessKey
	 *            - Put your Access Key here
	 * @param amount
	 *            - Enter the amount you want to collect for the item
	 * @param description
	 *            - description - Enter a description of the item
	 * @param signatureMethod
	 *            - Valid values are HmacSHA256 and HmacSHA1
	 * @param recipientEmail
	 *            - Enter the e-mail address for the seller.
	 * @param referenceId
	 *            - Optionally enter an ID that uniquely identifies this
	 *            transaction for your records
	 * @param abandonUrl
	 *            - Optionally, enter the URL where senders should be redirected
	 *            if they cancel their transaction
	 * @param returnUrl
	 *            - Optionally enter the URL where buyers should be redirected
	 *            after they complete the transaction
	 * @param immediateReturn
	 *            - Optionally, enter "1" if you want to skip the final status
	 *            page in Amazon Payments, 
	 * @param processImmediate
	 *            - Optionally, enter "1" if you want to settle the transaction
	 *            immediately else "0". Default value is "1"
	 * @param ipnUrl
	 *            - Optionally, type the URL of your host page to which Amazon
	 *            Payments should send the IPN transaction information.
	 * @param collectShippingAddress
	 *            - Optionally, enter "1" if you want Amazon Payments to return
	 *            the buyer's shipping address as part of the transaction
	 *            information.
	 * @param fixedMarketplaceFee
	 *            - Optionally, Enter the fixed market place fee
	 * @param variableMarketplaceFee
	 *            - Optionally, enter the variable market place fee
	 * @return - A map of key of key-value pair for all non null parameters
	 * @throws SignatureException
	 */
	public static Map<String, String> getMarketplacePayButtonParams(
			String accessKey, String amount, String description,
			String referenceId, String immediateReturn, String returnUrl,
			String abandonUrl, String processImmediate, String ipnUrl,
			String collectShippingAddress, String signatureMethod,
			String recipientEmail, String fixedMarketplaceFee,
			String variableMarketplaceFee) throws Exception {
		Map<String, String> formHiddenInputs = new HashMap<String, String>();
		String cobrandingStyle = COBRANDING_STYLE;

		 if(accessKey != null)   formHiddenInputs.put("accessKey", accessKey);
                else throw new Exception("AccessKey is Required");
                if(amount!=null)formHiddenInputs.put("amount", amount);
                else throw new Exception("Amount is Required");
                if(description!=null)formHiddenInputs.put("description", description);
                else throw new Exception("Description is Required");
                if(signatureMethod !=null)
                formHiddenInputs.put(SIGNATURE_METHOD_KEYNAME, signatureMethod);
                else throw new Exception("Signature Method is Required");
		if(recipientEmail!=null)formHiddenInputs.put("recipientEmail", recipientEmail);
                else throw new Exception("Recipient Email is Required");
		if (referenceId != null)
			formHiddenInputs.put("referenceId", referenceId);
		if (immediateReturn != null)
			formHiddenInputs.put("immediateReturn", immediateReturn);
		if (returnUrl != null)
			formHiddenInputs.put("returnUrl", returnUrl);
		if (abandonUrl != null)
			formHiddenInputs.put("abandonUrl", abandonUrl);
		if (processImmediate != null)
			formHiddenInputs.put("processImmediate", processImmediate);
		if (ipnUrl != null)
			formHiddenInputs.put("ipnUrl", ipnUrl);
		if (cobrandingStyle != null)
			formHiddenInputs.put("cobrandingStyle", cobrandingStyle);
		if (collectShippingAddress != null)
			formHiddenInputs.put("collectShippingAddress",
					collectShippingAddress);
		
		if (fixedMarketplaceFee != null)
			formHiddenInputs.put("fixedMarketplaceFee", fixedMarketplaceFee);
		if (variableMarketplaceFee != null)
			formHiddenInputs.put("variableMarketplaceFee",
					variableMarketplaceFee);
		
		formHiddenInputs.put(SIGNATURE_VERSION_KEYNAME, SIGNATURE_VERSION);

		return formHiddenInputs;
	}

	/**
	 * Creates a form from the provided key-value pairs
	 * 
	 * @param formHiddenInputs
	 *            - A map of key of key-value pair for all non null parameters
	 * @param serviceEndPoint
	 *            - The Endpoint to be used based on environment selected
	 * @param imageLocation
	 *            - The imagelocation based on environment
	 * @return - An html form created using the key-value pairs
	 */
	public static String getMarketplacePayButtonForm(
			Map<String, String> formHiddenInputs, String serviceEndPoint,
			String imageLocation) {
		StringBuilder form = new StringBuilder("");

		form.append("<form action=\"" + serviceEndPoint + "\" method=\""
				+ ASPHttpMethod + "\">\n");
		form.append("<input type=\"image\" src=\"" + imageLocation
				+ "\" border=\"0\">\n");
		Set<String> formHiddenInputNames = formHiddenInputs.keySet();
		for (String formHiddenInputName : formHiddenInputNames) {
			form.append("<input type=\"hidden\" name=\"" + formHiddenInputName
					+ "\" value=\"" + formHiddenInputs.get(formHiddenInputName)
					+ "\" >\n");
		}
		form.append("</form>\n");
		return form.toString();
	}

	/**
	 * Function creates a key-value pair for accepting MarketPlace Fee for
	 * recipient
	 * 
	 * @param accessKey
	 *            - Put your Access Key here
	 * @param callerReference
	 *            -Optionally, enter an ID that uniquely identifies this
	 *            transaction for callers Record
	 * @param returnUrl
         *             -Enter the URL where recipient should be redirected after they accept the Marketplace Fee
	 * @param signatureMethod
	 *            - Valid values are HmacSHA256 and HmacSHA1
	 * @param fixedMarketplaceFee
	 *            - Optionally, enter the fixed market place fee
	 * @param variableMarketplaceFee
	 *            - Optionally, enter the variable market place fee
	 * @return a map of key-value pair
	 * @throws java.security.SignatureException
	 */

	public static Map<String, String> getAcceptMarketplaceFeeButtonParams(
			String accessKey, String callerReference, String returnUrl,String signatureMethod,
			String fixedMarketplaceFee, String variableMarketplaceFee)
			throws Exception {
		String cobrandingStyle = "logo";
		// Create a Map of the hidden inputs in the form
		Map<String, String> formHiddenInputs = new HashMap<String, String>();
		if(accessKey!=null)formHiddenInputs.put("callerKey", accessKey);
		else throw new Exception("AccessKey is needed");
		if(returnUrl!=null)formHiddenInputs.put("returnUrl", returnUrl);
		else throw new Exception("Return Url is needed");
		if(signatureMethod !=null)
                formHiddenInputs.put(SIGNATURE_METHOD_KEYNAME, signatureMethod);
                else throw new Exception("Signature Method is Required");
		formHiddenInputs.put("pipelineName", "Recipient");
		formHiddenInputs.put("recipientPaysFee", "True");
		formHiddenInputs.put("collectEmailAddress", "True");
		if (callerReference == null) {
			callerReference = UUID.randomUUID().toString();
		}
		formHiddenInputs.put("callerReference", callerReference);
		if (fixedMarketplaceFee != null)
			formHiddenInputs.put("maxFixedFee", fixedMarketplaceFee);
		if (variableMarketplaceFee != null)
			formHiddenInputs.put("maxVariableFee", variableMarketplaceFee);
		if (cobrandingStyle != null)
			formHiddenInputs.put("cobrandingStyle", cobrandingStyle);

		formHiddenInputs.put(SIGNATURE_VERSION_KEYNAME, SIGNATURE_VERSION);
		return formHiddenInputs;
	}

	/**
	 * 
	 * @param formHiddenInputs
	 *            - Map of the hidden input fields in the Marketplace widget
	 *            form This map should have key = name of the hidden input and
	 *            value = value of the hidden input
	 * @param serviceEndPoint
	 *            - The Endpoint to be used based on environment selected
	 * @param imageLocation
	 *            - The imagelocation based on environment
	 * @param path
	 *            - request path
	 * @return - The HTML code for the Acceptint Marketplace form
	 */
	public static String getAcceptMarketplaceFeeButtonForm(
			Map<String, String> formHiddenInputs, String serviceEndPoint,
			String path, String imageLocation) {
		StringBuilder form = new StringBuilder("");
		form.append("<form action=\"https://" + serviceEndPoint + path
				+ "\" method=\"" + CBUIHttpMethod + "\">\n");
		form.append("<input type=\"image\" src=\"" + imageLocation
				+ "\" border=\"0\">\n");
		Set<String> formHiddenInputNames = formHiddenInputs.keySet();
		for (String formHiddenInputName : formHiddenInputNames) {
			form.append("<input type=\"hidden\" name=\"" + formHiddenInputName
					+ "\" value=\"" + formHiddenInputs.get(formHiddenInputName)
					+ "\" >\n");
		}
		form.append("</form>\n");
		return form.toString();
	}

	/**
	 * Function Generates the html form
	 * 
	 * @param accessKey
	 *            - Put your Access Key here
	 * @param secretKey
	 *            - Put your secret Key here
	 * @param amount
	 *            - Enter the amount you want to collect for the ite
	 * @param description
	 *            - description - Enter a description of the item
	 * @param referenceId
	 *            - Optionally enter an ID that uniquely identifies this
	 *            transaction for your records
	 * @param abandonUrl
	 *            - Optionally, enter the URL where senders should be redirected
	 *            if they cancel their transaction
	 * @param returnUrl
	 *     	      - Enter the URL where recipient should be redirected after they accept the Marketplace Fee
	 * @param immediateReturn
	 *            - Optionally, enter "1" if you want to skip the final status
	 *            page in Amazon Payments, 
	 * @param processImmediate
	 *            - Optionally, enter "1" if you want to settle the transaction
	 *            immediately else "0". Default value is "1"
	 * @param ipnUrl
	 *            - Optionally, type the URL of your host page to which Amazon
	 *            Payments should send the IPN transaction information.
	 * @param collectShippingAddress
	 *            - Optionally, enter "1" if you want Amazon Payments to return
	 *            the buyer's shipping address as part of the transaction
	 *            information
	 * @param recipientEmail
	 *            - Enter the e-mail address for the seller.
	 * @param fixedMarketplaceFee
	 *            - Optionally, enter the fixed market place fee
	 * @param variableMarketplaceFee
	 *            - Optionally, enter the variable market place fee
	 * @param callerReference
	 *            - Optionally, enter an ID that uniquely identifies this
	 *            transaction for callers Record
	 * @param signatureMethod
	 *            - Valid values are HmacSHA256 and HmacSHA1
	 * @param environment
	 *            - Sets the environment where your form will point to can be
	 *            "sandbox" or "prod"
	 * @return - A map of key of key-value pair for all non null parameters
	 * @throws SignatureException
	 */

	public static String GenerateMarketPlacePayButtonForm(String accessKey,
			String secretKey, String amount, String description,
			String referenceId, String immediateReturn, String returnUrl,
			String abandonUrl, String processImmediate, String ipnUrl,
			String collectShippingAddress, String signatureMethod,
			String recipientEmail, String fixedMarketplaceFee,
			String variableMarketplaceFee, String environment) throws Exception {

		String endPoint, imageLocation;
		 if (environment.equals("prod")) {
                        endPoint = PROD_END_POINT;
                        imageLocation = PROD_IMAGE_LOCATION;
                } else {
                        endPoint = SANDBOX_END_POINT;
                        imageLocation = SANDBOX_IMAGE_LOCATION;

                }

		URI serviceEndPoint = new URI(endPoint);

		// marketPlace Button
		
		Map<String, String> params = getMarketplacePayButtonParams(accessKey,
				amount, description, referenceId, immediateReturn, returnUrl,
				abandonUrl, processImmediate, ipnUrl, collectShippingAddress,
				signatureMethod, recipientEmail, fixedMarketplaceFee,
				variableMarketplaceFee);
		String signature = SignatureUtils.signParameters(params, secretKey,
				ASPHttpMethod, serviceEndPoint.getHost(), serviceEndPoint
						.getPath(),signatureMethod);
		params.put(SIGNATURE_KEYNAME, signature);
		String MarketPlaceButtonForm = getMarketplacePayButtonForm(params,
				endPoint, imageLocation);
		return MarketPlaceButtonForm;

	}

	public static String GenerateAcceptMarketplaceFeeButtonForm(String accessKey,
			String secretKey, String returnUrl, String signatureMethod,
			String fixedMarketplaceFee, String variableMarketplaceFee,
			String callerReference, String environment) throws Exception {

		String endPoint, marketPlaceImage;

		  if (environment.equals("prod")) {
                        endPoint = PROD_END_POINT;
                        marketPlaceImage = PROD_MP_IMAGE_LOCATION;
                } else {
                        endPoint = SANDBOX_END_POINT;
                        marketPlaceImage = SANDBOX_MP_IMAGE_LOCATION;

                }

		URI serviceEndPoint = new URI(endPoint);

		Map<String, String> paramsForRecipient = getAcceptMarketplaceFeeButtonParams(
				accessKey, callerReference, returnUrl,signatureMethod, fixedMarketplaceFee,
				variableMarketplaceFee);
		String signature = SignatureUtils.signParameters(paramsForRecipient,
				secretKey, CBUIHttpMethod, serviceEndPoint.getHost(),
				CBUI_REQUEST_URI,signatureMethod );
		paramsForRecipient.put(SIGNATURE_KEYNAME, signature);
		String AcceptMarketplaceFeeButtonForm = getAcceptMarketplaceFeeButtonForm(
				paramsForRecipient, serviceEndPoint.getHost(),
				CBUI_REQUEST_URI, marketPlaceImage);
		return AcceptMarketplaceFeeButtonForm;

	}
}
