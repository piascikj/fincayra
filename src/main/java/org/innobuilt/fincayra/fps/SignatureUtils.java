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

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.security.SignatureException;
import java.util.Iterator;
import java.util.Map;
import java.util.TreeMap;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Base64;

public class SignatureUtils {

	// Constants used when constructing the string to sign for v2
	public static final String NewLine = "\n";
	public static final String EmptyUriPath = "/";
	public static final String Equals = "=";
	public static final String And = "&";
	public static final String UTF_8_Encoding = "UTF-8";

	public static final String SIGNATURE_KEYNAME = "signature";
	

	/**
	 * Computes RFC 2104-compliant HMAC signature for request parameters This
	 * involves 2 steps - Calculate string-to-sign and then compute signature
	 * 
	 * Step 1: Calculate string-to-sign
	 *  In Signature Version 2, string to sign is based on following:
	 * 
	 * 1. The HTTP Request Method (POST or GET) followed by an ASCII newline
	 * (%0A) 2. The HTTP Host header in the form of lowercase host, followed by
	 * an ASCII newline. 3. The URL encoded HTTP absolute path component of the
	 * URI (up to but not including the query string parameters); if this is
	 * empty use a forward '/'. This parameter is followed by an ASCII newline.
	 * 4. The concatenation of all query string components (names and values) as
	 * UTF-8 characters which are URL encoded as per RFC 3986 (hex characters
	 * MUST be uppercase), sorted using lexicographic byte ordering. Parameter
	 * names are separated from their values by the '=' character (ASCII
	 * character 61), even if the value is empty. Pairs of parameter and values
	 * are separated by the '&' character (ASCII code 38).
	 * 
	 * Step 2: Compute RFC 2104-compliant HMAC signature
	 */
	public static String signParameters(Map<String, String> parameters,
			String key, String httpMethod, String host, String requestURI,
			String signatureMethod) throws SignatureException {
		String stringToSign = null;
		String signature = null;
		stringToSign = calculateStringToSignV2(parameters, httpMethod, host,
				requestURI);
		signature = sign(stringToSign, key, signatureMethod);
		return signature;
	}

	/**
	 * Calculate String to Sign 
	 * 
	 * @param parameters
	 * @param httpMethod
	 *            - POST or GET
	 * @param hostHeader
	 *            - Service end point
	 * @param requestURI
	 *            - Path
	 * @return
	 * @throws SignatureException
	 */
	public static String calculateStringToSignV2(
			Map<String, String> parameters, String httpMethod,
			String hostHeader, String requestURI) throws SignatureException {
		StringBuffer stringToSign = new StringBuffer("");
		if (httpMethod == null)
			throw new SignatureException("HttpMethod cannot be null");
		stringToSign.append(httpMethod);
		stringToSign.append(NewLine);

		// The host header - must eventually convert to lower case
		// Host header should not be null, but in Http 1.0, it can be, in that
		// case just append empty string ""
		if (hostHeader == null)
			stringToSign.append("");
		else
			stringToSign.append(hostHeader.toLowerCase());
		stringToSign.append(NewLine);

		if (requestURI == null || requestURI.length() == 0)
			stringToSign.append(EmptyUriPath);
		else
			stringToSign.append(v2UrlEncode(requestURI, true));
		stringToSign.append(NewLine);

		Map<String, String> sortedParamMap = new TreeMap<String, String>();
		sortedParamMap.putAll(parameters);
		Iterator<Map.Entry<String, String>> pairs = sortedParamMap.entrySet()
				.iterator();
		while (pairs.hasNext()) {
			Map.Entry<String, String> pair = pairs.next();
			if (pair.getKey().equalsIgnoreCase(SIGNATURE_KEYNAME))
				continue;
			stringToSign.append(v2UrlEncode(pair.getKey(), false));
			stringToSign.append(Equals);
			stringToSign.append(v2UrlEncode(pair.getValue(), false));
			if (pairs.hasNext())
				stringToSign.append(And);
		}
		return stringToSign.toString();
	}

	/**
	 * Url Encode the String 
	 * @param value
	 * @param path
	 * @return
	 */
	private static String v2UrlEncode(String value, boolean path) {
		String encoded = null;
		try {
			encoded = URLEncoder.encode(value, UTF_8_Encoding).replace("+",
					"%20").replace("*", "%2A").replace("%7E", "~");
			if (path)
				encoded = encoded.replace("%2F", "/");
		} catch (UnsupportedEncodingException ex) {
			throw new RuntimeException(ex);
		}
		return encoded;
	}

	//  Computes RFC 2104-compliant HMAC signature.

	public static String sign(String data, String key, String signatureMethod)
			throws SignatureException {
		String signature = "";
		try {
			Mac mac = Mac.getInstance(signatureMethod);
			mac.init(new SecretKeySpec(key.getBytes(), signatureMethod));
			signature = new String(Base64.encodeBase64(mac.doFinal(data
					.getBytes(UTF_8_Encoding))));
		} catch (Exception e) {
			throw new SignatureException("Failed to generate signature: "
					+ e.getMessage(), e);
		}
		return signature;
	}
}
