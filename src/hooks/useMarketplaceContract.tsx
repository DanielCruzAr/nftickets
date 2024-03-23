import { Contract } from "ethers";
import { useMemo } from "react";
import { IWeb3Context, useWeb3Context } from "@/context/web3Context";
import ABI from "@/backend/contractsData/TicketMarketplace.json";
import ContractAddress from "@/backend/contractsData/TicketMarketplace-address.json";

const useMarketplaceContract = () => {
    const { state } = useWeb3Context() as IWeb3Context;

    return useMemo(
        () => state.signer ? new Contract(ContractAddress.address, ABI.abi, state.signer) : null,
        [state.signer]
    );
};

export default useMarketplaceContract;
