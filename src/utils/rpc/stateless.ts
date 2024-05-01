import * as crypto from "crypto";
import * as sshpk from "sshpk";
import * as nacl from "tweetnacl";

/**
 * An attestation consists of the signature of the attester and cryptographic proof
 */
export type Attestation = {
    /**
     * The signature of the attester
     */
    signature: string;

    /**
     * The signature format (i.e. "ssh-ed25519")
     */
    signatureFormat: string;

    /**
     * The hashing algorithm used to hash the data (i.e. "sha256")
     */
    hashAlgo: string;

    /**
     * The hashed message data
     */
    msg: string;

    /**
     * The identifier of the attester
     */
    identity: string;
};

/**
*  A JSON-RPC result, which are returned on success from a JSON-RPC server.
*/
export type AttestedJsonRpcResult =  {
     /**
     *  The response ID to match it to the relevant request.
     */
     id: number;

     /**
      *  The response result.
      */
     result: any;
    /**
     * Attestation data for the request.
     */
    attestations: Array<Attestation>;
};

export async function handleAndBlockNumberReqs(resp: any): Promise<any> {
  if (!Array.isArray(resp)) {
    resp = await handleResp(resp)
  }

  for (let i = 0; i < resp.length; i++) {
    resp[i] = await handleResp(resp[i])
  }

  return resp
}

async function handleResp(response: AttestedJsonRpcResult): Promise<AttestedJsonRpcResult> {
  let change: boolean = false;
  let resultToChange: any;
  if (response.result instanceof Object && Object.keys(response.result).length == 2) {
    for (const [key, value] of Object.entries(response.result)) {
      if (key == 'blockNumber') {
        change = true
      } else {
        resultToChange = value
      }
    }
  }

  if (change) {
    response.result = resultToChange
  }

  return response
}

export async function handleAttestations(resp: any, minimumRequiredAttestations: number = 1,
  identities?: string[]): Promise<void> {
    // If the response is not an array, convert it to an array
    if (!Array.isArray(resp)) {
        resp = [resp];
    }
 
    // Loop through each result in the response array
    for (let i = 0; i < resp.length; i++) {
        const result = resp[i];
 
        // Verify the attested JSON-RPC response
        const isValid = await verifyAttestedJsonRpcResponse(
            result,
            minimumRequiredAttestations,
            identities
        );
 
        // If the response does not meet the attestation threshold, throw an error
        if (!isValid) {
            throw new Error(`Request did not meet the attestation threshold of ${minimumRequiredAttestations}.`);
        }
    }
};

async function verifyAttestedJsonRpcResponse(
    response: AttestedJsonRpcResult,
    minimumRequiredAttestations: number = 1,
    identities?: string[]
  ): Promise<boolean> {
    // Generate hash of the response result
    const resultBytes = Buffer.from(JSON.stringify(response.result));
    const hash = crypto.createHash("sha256").update(resultBytes).digest();

    const validAttestations: Attestation[] = [];


    for (let i = 0; i < response.attestations.length; i++) {
      const attestation = response.attestations[i];
      // There's a chance the attestation does not have an identity if it's a batch response
      // In that case, use the provided identities
      if (identities && !attestation.identity) {
        attestation.identity = identities[i];
      }

      // If identities are provided, only use attestations from those identities
      if (identities && !identities.includes(attestation.identity)) {
        continue;
      }

      const sshPublicKeyStr = await publicKeyFromIdentity(attestation.identity);
      const key = sshpk.parseKey(sshPublicKeyStr, "ssh");

      if (key.type !== "ed25519") {
        throw new Error("The provided key is not an ed25519 key");
      }
      // @ts-ignore
      const publicKeyUint8Array = new Uint8Array(key.part.A.data);

      if (!verifyAttestation(attestation, publicKeyUint8Array, hash)) {
        continue;
      }

      validAttestations.push(attestation);
    }

    // Count the number of attestations for each message
    const msgCounts: { [key: string]: number } = {};
    for (const attestation of validAttestations) {
      msgCounts[attestation.msg] = (msgCounts[attestation.msg] || 0) + 1;
    }

    // Determine if consensus threshold is met
    return Object.values(msgCounts).some(
      (count) => count >= minimumRequiredAttestations
    );
}

async function publicKeyFromIdentity(identity: string): Promise<string> {
  const url = `${identity}/.well-known/stateless-key`;

  try {
      // Fetch data from the URL
      const response = await fetch(url);

      // Check if the response is successful (status code 2xx)
      if (!response.ok) {
          throw new Error(`Could not fetch public key from ${url}. Status code: ${response.status}`);
      }

      // Read and return the response body as text
      return await response.text();
  } catch (error) {
      // Handle any errors that occur during the fetch operation
      throw new Error(`Error fetching public key from ${url}: ${(error as Error).message}`);
  }
}

function verifyAttestation(
  attestation: Attestation,
  publicKey: Uint8Array,
  hash: Buffer
): boolean {
  const signatureBytes = Buffer.from(attestation.signature, "hex");
  const signatureUint8Array = new Uint8Array(signatureBytes);

  return nacl.sign.detached.verify(
    new Uint8Array(hash),
    signatureUint8Array,
    publicKey
  );
}
 