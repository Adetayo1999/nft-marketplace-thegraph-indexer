import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  NFTBought as NFTBoughtEvent,
  NFTListed as NFTListedEvent,
  NFTListingCancelled as NFTListingCancelledEvent,
} from "../generated/NftMarketPlace/NftMarketPlace";
import {
  NFTBought,
  NFTListed,
  NFTListingCancelled,
  ActiveItem,
} from "../generated/schema";

function getIdFromEventParams(
  tokenId: BigInt,
  nftAddress: Address,
  sellerAddress: Address
): string {
  return (
    tokenId.toHexString() +
    nftAddress.toHexString() +
    sellerAddress.toHexString()
  );
}

export function handleNFTBought(event: NFTBoughtEvent): void {
  const id = getIdFromEventParams(
    event.params.tokenId,
    event.params.nftAddress,
    event.params.seller
  );
  const nftBought = NFTBought.load(id);
  const activeNFTItem = ActiveItem.load(id);

  if (!nftBought) {
    const newNFTBought = new NFTBought(id);
    newNFTBought.tokenId = event.params.tokenId;
    newNFTBought.seller = event.params.seller;
    newNFTBought.buyer = event.params.buyer;
    newNFTBought.nftAddress = event.params.nftAddress;
    newNFTBought.price = event.params.price;
    newNFTBought.blockNumber = event.block.number;
    newNFTBought.blockTimestamp = event.block.timestamp;
    newNFTBought.transactionHash = event.transaction.hash;

    if (activeNFTItem) {
      activeNFTItem.buyer = event.params.buyer;
      activeNFTItem.save();
    }

    newNFTBought.save();
  }
}

export function handleNFTListed(event: NFTListedEvent): void {
  const id = getIdFromEventParams(
    event.params.tokenId,
    event.params.nftAddress,
    event.params.seller
  );
  let nftListed = NFTListed.load(id);
  let activeNFTItem = ActiveItem.load(id);

  if (!nftListed) {
    nftListed = new NFTListed(id);
  }

  if (!activeNFTItem) {
    activeNFTItem = new ActiveItem(id);
  }

  nftListed.tokenId = event.params.tokenId;
  nftListed.seller = event.params.seller;
  nftListed.nftAddress = event.params.nftAddress;
  nftListed.blockTimestamp = event.block.timestamp;
  nftListed.blockNumber = event.block.number;
  nftListed.transactionHash = event.transaction.hash;
  nftListed.price = event.params.price;

  activeNFTItem.tokenId = event.params.tokenId;
  activeNFTItem.seller = event.params.seller;
  activeNFTItem.buyer = Address.fromString(
    "0x0000000000000000000000000000000000000000"
  );
  activeNFTItem.nftAddress = event.params.nftAddress;
  activeNFTItem.price = event.params.price;

  nftListed.save();
  activeNFTItem.save();
}

export function handleNFTListingCancelled(
  event: NFTListingCancelledEvent
): void {
  const id = getIdFromEventParams(
    event.params.tokenId,
    event.params.nftAddress,
    event.params.owner
  );
  let nftCancelled = NFTListingCancelled.load(id);
  let activeNFTItem = ActiveItem.load(id);

  if (!nftCancelled) {
    nftCancelled = new NFTListingCancelled(id);
  }

  nftCancelled.owner = event.params.owner;
  nftCancelled.nftAddress = event.params.nftAddress;
  nftCancelled.tokenId = event.params.tokenId;
  nftCancelled.blockNumber = event.block.number;
  nftCancelled.blockTimestamp = event.block.timestamp;
  nftCancelled.transactionHash = event.transaction.hash;

  if (activeNFTItem) {
    activeNFTItem.buyer = Address.fromString(
      "0x000000000000000000000000000000000000dEaD"
    );
    activeNFTItem.save();
  }

  nftCancelled.save();
}
