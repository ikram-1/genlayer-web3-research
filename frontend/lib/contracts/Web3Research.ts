import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import {
  estimateWriteFeePreset,
  feePresetToTransactionFees,
  type FeePresetEstimate,
  type FeePresetLevel,
} from "../genlayer/fees";

class Web3Research {
  private contractAddress: `0x${string}`;
  private client: any;
  private studioUrl?: string;

  constructor(
    contractAddress: string,
    address?: string | null,
    studioUrl?: string
  ) {
    this.contractAddress = contractAddress as `0x${string}`;
    this.studioUrl = studioUrl;

    const config: any = {
      chain: studionet,
    };

    if (address) {
      config.account = address as `0x${string}`;
    }

    if (studioUrl) {
      config.endpoint = studioUrl;
    }

    this.client = createClient(config);
  }

  updateAccount(address: string): void {
    const config: any = {
      chain: studionet,
      account: address as `0x${string}`,
    };

    if (this.studioUrl) {
      config.endpoint = this.studioUrl;
    }

    this.client = createClient(config);
  }

  async getProject(name: string): Promise<string> {
    return await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_project",
      args: [name],
    });
  }

  async getVerification(name: string): Promise<string> {
    return await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_verification",
      args: [name],
    });
  }

  async estimateAddProjectFees(
    name: string,
    website: string,
    level: FeePresetLevel = "standard"
  ): Promise<FeePresetEstimate | undefined> {
    return estimateWriteFeePreset(
      this.client,
      {
        address: this.contractAddress,
        functionName: "add_project",
        args: [name, website],
      },
      level
    );
  }

  async addProject(
    name: string,
    website: string,
    feePreset?: FeePresetEstimate
  ): Promise<any> {
    const fees = feePresetToTransactionFees(feePreset);

    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "add_project",
      args: [name, website],
      value: BigInt(0),
      ...(fees ? { fees } : {}),
    });

    return await this.client.waitForTransactionReceipt({
      hash: txHash,
      status: "ACCEPTED" as any,
      retries: 24,
      interval: 5000,
    });
  }

  async verifyProjectClaim(
    name: string,
    operation: string,
    claimType: string,
    claim: string,
    requiredEvidence: string,
    evidenceSummary: string,
    feePreset?: FeePresetEstimate
  ): Promise<any> {
    const fees = feePresetToTransactionFees(feePreset);

    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "verify_project_claim",
      args: [
        name,
        operation,
        claimType,
        claim,
        requiredEvidence,
        evidenceSummary,
      ],
      value: BigInt(0),
      ...(fees ? { fees } : {}),
    });

    console.log("VERIFICATION TX HASH:", txHash);

    try {
      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 120,
        interval: 5000,
      });

      console.log("VERIFICATION RECEIPT:", receipt);
      console.log("STATUS NAME:", receipt?.status_name);
      console.log("RESULT NAME:", receipt?.result_name);
      console.log("CONSENSUS DATA:", receipt?.consensus_data);

      if (
        receipt?.status_name === "ACCEPTED" &&
        receipt?.result_name === "MAJORITY_AGREE"
      ) {
        return receipt;
      }

      const diagnosticText = JSON.stringify(
        receipt?.consensus_data ?? receipt
      );

      if (
        diagnosticText.includes("403") ||
        diagnosticText.includes("Forbidden")
      ) {
        throw new Error(
          "WEBSITE_ACCESS_DENIED: The project's website returned HTTP 403 (Forbidden)."
        );
      }

      if (
        diagnosticText.includes("404") ||
        diagnosticText.includes("Not Found")
      ) {
        throw new Error(
          "WEBSITE_NOT_FOUND: The project's website returned HTTP 404 (Not Found)."
        );
      }

      if (
        diagnosticText.includes("WEBPAGE_LOAD_FAILED") ||
        diagnosticText.includes("ENOTFOUND") ||
        diagnosticText.includes("DNS") ||
        diagnosticText.includes("ERR_NAME_NOT_RESOLVED")
      ) {
        throw new Error(
          "WEBSITE_UNREACHABLE: The project's website could not be reached."
        );
      }

      if (
        diagnosticText.includes("500") ||
        diagnosticText.includes("502") ||
        diagnosticText.includes("503") ||
        diagnosticText.includes("504")
      ) {
        throw new Error(
          "WEBSITE_SERVER_ERROR: The project's website returned a server error."
        );
      }

      throw new Error(
        "VERIFICATION_FAILED: GenLayer could not reach consensus on the verification request."
      );
    } catch (error: any) {
      console.error("VERIFICATION TRANSACTION ERROR:", error);
      throw error;
    }
  }
}

export default Web3Research;
