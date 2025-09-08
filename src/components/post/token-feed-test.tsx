// import { useState, useRef, useEffect, useCallback, useMemo } from "react";
// import { TokenCard } from "./token-card/token-card";
// import { ActionCard } from "./action-card";
// import { EmptyTokenFeed } from "./empty-token-feed";
// import {
//   useMemeControllerFindRandom,
//   useMemeControllerFindRandomInWatchList,
//   useMemeControllerFindDetail,
//   useMemeControllerFindById,
// } from "@/services/queries";
// import { showTokenBuyModal } from "@/features/trade/buy";
// import { useQueryState } from "nuqs";
// import { VideoPlayer } from "./token-card/video-player";
// import { useQueryClient } from "@tanstack/react-query";

// interface TokenFeedProps {
//   type: "for-you" | "watchlist";
// }

// interface TouchState {
//   startX: number | null;
//   startY: number | null;
//   currentX: number | null;
//   currentY: number | null;
// }

// const SWIPE_THRESHOLD = 50;
// const SLIDE_SPEED_MS = 500;
// const PRELOAD_COUNT = 5;
// const SWIPE_ANGLE_THRESHOLD = 45;

// const isValidVideoUrl = (url: string | undefined): boolean => {
//   if (!url) return false;
//   return url.startsWith("blob:") || url.startsWith("http");
// };

// // Custom hook for managing multiple random token queries
// const useNextTokenQueries = (type: TokenFeedProps["type"], count: number) => {
//   const queries = useMemo(
//     () => Array.from({ length: count }, (_, i) => i + 1),
//     [count]
//   );

//   const forYouQueries = queries.map((i) =>
//     useMemeControllerFindRandom({
//       query: {
//         queryKey: [`next-token-${i}`],
//         enabled: type === "for-you",
//         refetchOnWindowFocus: false,
//         refetchOnReconnect: false,
//         refetchOnMount: true,
//       },
//     })
//   );

//   const watchlistQueries = queries.map((i) =>
//     useMemeControllerFindRandomInWatchList({
//       query: {
//         queryKey: [`next-token-watchlist-${i}`],
//         enabled: type === "watchlist",
//         refetchOnWindowFocus: false,
//         refetchOnReconnect: false,
//         refetchOnMount: true,
//       },
//     })
//   );

//   const data = useMemo(
//     () =>
//       type === "for-you"
//         ? forYouQueries.map((q) => q.data)
//         : watchlistQueries.map((q) => q.data),
//     [type, forYouQueries, watchlistQueries]
//   );

//   const refetchFns = useMemo(
//     () =>
//       type === "for-you"
//         ? forYouQueries.map((q) => q.refetch)
//         : watchlistQueries.map((q) => q.refetch),
//     [type, forYouQueries, watchlistQueries]
//   );

//   return { data, refetchFns };
// };

// export const TokenFeed = ({ type }: TokenFeedProps) => {
//   const queryClient = useQueryClient();
//   const [isMuted, setIsMuted] = useState(true);
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [searchTokenAddress, setSearchTokenAddress] = useQueryState("token");
//   const [searchVideoId, setSearchVideoId] = useQueryState("videoId");
//   const [shouldPreloadVideos, setShouldPreloadVideos] = useState(false);

//   // Carousel state
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [carouselItems, setCarouselItems] = useState<any[]>([]);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [isTransitioning, setIsTransitioning] = useState(false);

//   // Virtual sliding states
//   const [virtualPosition, setVirtualPosition] = useState(0);
//   const [isVirtualSliding, setIsVirtualSliding] = useState(false);

//   // Simple swipe states (from the second file)
//   const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
//     null
//   );
//   const [swipeProgress, setSwipeProgress] = useState(0);
//   const touchStartX = useRef<number | null>(null);
//   const touchStartY = useRef<number | null>(null);
//   const touchCurrentX = useRef<number | null>(null);
//   const touchCurrentY = useRef<number | null>(null);
//   const isMouseDown = useRef(false);

//   // Custom hooks
//   const { data: nextTokenDatas, refetchFns } = useNextTokenQueries(
//     type,
//     PRELOAD_COUNT
//   );

//   // Auto-enable preload
//   useEffect(() => {
//     const timer = setTimeout(() => setShouldPreloadVideos(true), 2000);
//     return () => clearTimeout(timer);
//   }, []);

//   // Main token queries
//   const {
//     data: specificTokenDataByAddress,
//     isLoading: isSpecificTokenByAddressLoading,
//   } = useMemeControllerFindDetail(searchTokenAddress || "", {
//     query: {
//       enabled: !!searchTokenAddress,
//       refetchOnWindowFocus: false,
//       refetchOnReconnect: false,
//       refetchOnMount: false,
//     },
//   });

//   const {
//     data: specificVideoDataByVideoId,
//     isLoading: isSpecificVideoByVideoIdLoading,
//   } = useMemeControllerFindById(searchVideoId || "", {
//     query: {
//       enabled: !!searchVideoId,
//       refetchOnWindowFocus: false,
//       refetchOnReconnect: false,
//       refetchOnMount: false,
//     },
//   });

//   const {
//     data: forYouTokenData,
//     isLoading: isForYouTokenLoading,
//     refetch: refetchForYouToken,
//   } = useMemeControllerFindRandom({
//     query: {
//       queryKey: ["current-token"],
//       refetchOnWindowFocus: false,
//       refetchOnReconnect: false,
//       refetchOnMount: false,
//       enabled: type === "for-you" && !searchTokenAddress,
//     },
//   });

//   const {
//     data: watchlistTokenData,
//     isLoading: isWatchlistTokenLoading,
//     refetch: refetchWatchlistToken,
//   } = useMemeControllerFindRandomInWatchList({
//     query: {
//       queryKey: ["current-token-watchlist"],
//       refetchOnWindowFocus: false,
//       refetchOnReconnect: false,
//       refetchOnMount: false,
//       enabled: type === "watchlist" && !searchTokenAddress,
//     },
//   });

//   // Computed values
//   const currentTokenData = useMemo(() => {
//     if (searchVideoId) return specificVideoDataByVideoId;
//     if (searchTokenAddress) return specificTokenDataByAddress;
//     return type === "for-you" ? forYouTokenData : watchlistTokenData;
//   }, [
//     searchVideoId,
//     searchTokenAddress,
//     type,
//     specificVideoDataByVideoId,
//     specificTokenDataByAddress,
//     forYouTokenData,
//     watchlistTokenData,
//   ]);

//   const isCurrentTokenLoading = useMemo(() => {
//     if (searchVideoId) return isSpecificVideoByVideoIdLoading;
//     if (searchTokenAddress) return isSpecificTokenByAddressLoading;
//     return type === "for-you" ? isForYouTokenLoading : isWatchlistTokenLoading;
//   }, [
//     searchVideoId,
//     searchTokenAddress,
//     type,
//     isSpecificVideoByVideoIdLoading,
//     isSpecificTokenByAddressLoading,
//     isForYouTokenLoading,
//     isWatchlistTokenLoading,
//   ]);

//   const refetchCurrentToken =
//     type === "for-you" ? refetchForYouToken : refetchWatchlistToken;
//   const currentKey =
//     type === "for-you" ? "current-token" : "current-token-watchlist";
//   const nextKey = useCallback(
//     (i: number) =>
//       type === "for-you"
//         ? `next-token-${i + 1}`
//         : `next-token-watchlist-${i + 1}`,
//     [type]
//   );

//   // Preload videos
//   useEffect(() => {
//     const preloadVideo = (url?: string) => {
//       if (!isValidVideoUrl(url) || url!.startsWith("blob:")) return;
//       const link = document.createElement("link");
//       link.rel = "preload";
//       link.as = "video";
//       link.href = url!;
//       link.type = "video/mp4";
//       document.head.appendChild(link);
//       setTimeout(() => {
//         if (document.head.contains(link)) document.head.removeChild(link);
//       }, 10000);
//     };
//     nextTokenDatas.forEach((t) => preloadVideo(t?.videoInfo?.url));
//   }, [nextTokenDatas]);

//   // Refetch invalid tokens
//   useEffect(() => {
//     if (!nextTokenDatas.length) return;
//     nextTokenDatas.forEach((t, idx) => {
//       if (!t) return;
//       const prevIds = [
//         currentTokenData?.id,
//         ...nextTokenDatas.slice(0, idx).map((p) => p?.id),
//       ];
//       if (
//         (t.id && prevIds.includes(t.id)) ||
//         !isValidVideoUrl(t.videoInfo?.url)
//       ) {
//         refetchFns[idx]();
//       }
//     });
//   }, [currentTokenData?.id, refetchFns, nextTokenDatas]);

//   // Initialize carousel
//   useEffect(() => {
//     if (!currentTokenData || isInitialized) return;

//     const seen = new Set<string>();
//     const validTokens = [currentTokenData, ...nextTokenDatas]
//       .filter(Boolean)
//       .filter((t: any) => {
//         if (!t?.id || !isValidVideoUrl(t.videoInfo?.url) || seen.has(t.id))
//           return false;
//         seen.add(t.id);
//         return true;
//       });

//     const seedItems = validTokens.slice(0, PRELOAD_COUNT);
//     setCarouselItems(seedItems);
//     if (seedItems.length === PRELOAD_COUNT) {
//       setActiveIndex(0);
//       setIsInitialized(true);
//     }
//   }, [currentTokenData?.id, nextTokenDatas, isInitialized]);

//   // Reset on context change
//   useEffect(() => {
//     setIsInitialized(false);
//     setCarouselItems([]);
//     setActiveIndex(0);
//     setVirtualPosition(0);
//     setIsVirtualSliding(false);
//   }, [type, searchTokenAddress, searchVideoId]);

//   const currentDisplayed = carouselItems[activeIndex] ?? currentTokenData;

//   // Fetch unique tail item
//   const fetchNextUniqueTail = useCallback(
//     async (seenIds: Set<string>) => {
//       const lastIdx = PRELOAD_COUNT - 1;
//       for (let i = 0; i < 3; i++) {
//         await refetchFns[refetchFns.length - 1]();
//         const candidate = queryClient.getQueryData([nextKey(lastIdx)]) as any;
//         if (
//           candidate?.id &&
//           !seenIds.has(candidate.id) &&
//           isValidVideoUrl(candidate.videoInfo?.url)
//         ) {
//           return candidate;
//         }
//       }
//       return null;
//     },
//     [queryClient, refetchFns, nextKey]
//   );

//   // Calculate transform value
//   const getTransformValue = () => {
//     if (isVirtualSliding) {
//       return `-${virtualPosition * (100 / carouselItems.length)}%`;
//     }
//     return `-${activeIndex * (100 / carouselItems.length)}%`;
//   };

//   // Get current active position for UI elements
//   const getCurrentActivePosition = () => {
//     return isVirtualSliding ? virtualPosition : activeIndex;
//   };

//   // Navigate to next item with virtual sliding
//   const goToNext = useCallback(async () => {
//     if (carouselItems.length === 0) return;

//     const isNearTail = activeIndex >= carouselItems.length - 2;

//     if (isNearTail) {
//       // Step 1: Start virtual sliding animation
//       setIsVirtualSliding(true);
//       setVirtualPosition(activeIndex + 1);

//       // Step 2: Wait for animation to complete
//       await new Promise((resolve) => setTimeout(resolve, SLIDE_SPEED_MS));

//       // Step 3: Update data in background
//       const seen = new Set(
//         carouselItems.map((i) => i?.id).filter(Boolean) as string[]
//       );
//       const dropCount = Math.max(1, activeIndex - 1);
//       const additions: any[] = [];

//       for (let k = 0; k < dropCount; k++) {
//         const fresh = await fetchNextUniqueTail(seen);
//         if (!fresh) break;
//         additions.push(fresh);
//         if (fresh.id) seen.add(fresh.id);
//       }

//       // Step 4: Update carousel items and reset positions
//       setCarouselItems((prev) => [...prev.slice(dropCount), ...additions]);
//       setIsVirtualSliding(false);
//       setVirtualPosition(0);
//       setActiveIndex(2);

//       return;
//     }

//     // Normal case: regular transition
//     setIsTransitioning(true);
//     setActiveIndex((prev) =>
//       Math.min(prev + 1, Math.max(0, carouselItems.length - 1))
//     );
//   }, [activeIndex, carouselItems, fetchNextUniqueTail]);

//   // Simple touch handlers (from the second file)
//   const handleTouchStart = (e: React.TouchEvent) => {
//     touchStartX.current = e.touches[0].clientX;
//     touchStartY.current = e.touches[0].clientY;
//     touchCurrentX.current = e.touches[0].clientX;
//     touchCurrentY.current = e.touches[0].clientY;
//     setSwipeDirection(null);
//     setSwipeProgress(0);
//   };

//   const handleTouchMove = (e: React.TouchEvent) => {
//     if (!touchStartX.current || !touchStartY.current) return;

//     touchCurrentX.current = e.touches[0].clientX;
//     touchCurrentY.current = e.touches[0].clientY;

//     const deltaX = touchCurrentX.current - touchStartX.current;
//     const deltaY = touchCurrentY.current - touchStartY.current;

//     // Calculate the angle of the swipe
//     const angle = Math.abs((Math.atan2(deltaY, deltaX) * 180) / Math.PI);

//     // If the angle is between 0-45 or 135-180 degrees, it's more horizontal than vertical
//     if (angle <= 45 || angle >= 135) {
//       // Horizontal swipe
//       const direction = deltaX > 0 ? "right" : "left";
//       setSwipeDirection(direction);

//       // Calculate swipe progress (0 to 1)
//       const progress = Math.min(Math.abs(deltaX) / (window.innerWidth / 2), 1);
//       setSwipeProgress(progress);
//     }
//   };

//   const handleTouchEnd = () => {
//     if (!touchStartX.current || !touchCurrentX.current) return;

//     const deltaX = touchCurrentX.current - touchStartX.current;

//     // Check if swipe was significant enough
//     if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
//       if (deltaX > 0) {
//         // Swipe right - Like
//         handleLike();
//       } else {
//         // Swipe left - Dislike
//         handleDislike();
//       }
//     }

//     // Reset touch values and swipe state
//     touchStartX.current = null;
//     touchStartY.current = null;
//     touchCurrentX.current = null;
//     touchCurrentY.current = null;
//     setSwipeDirection(null);
//     setSwipeProgress(0);
//   };

//   // Mouse handlers for desktop swipe (from the second file)
//   const handleMouseDown = (e: React.MouseEvent) => {
//     isMouseDown.current = true;
//     touchStartX.current = e.clientX;
//     touchStartY.current = e.clientY;
//     touchCurrentX.current = e.clientX;
//     touchCurrentY.current = e.clientY;
//     setSwipeDirection(null);
//     setSwipeProgress(0);
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (
//       !isMouseDown.current ||
//       touchStartX.current === null ||
//       touchStartY.current === null
//     )
//       return;

//     touchCurrentX.current = e.clientX;
//     touchCurrentY.current = e.clientY;

//     const deltaX = touchCurrentX.current - touchStartX.current;
//     const deltaY = touchCurrentY.current - touchStartY.current;

//     const angle = Math.abs((Math.atan2(deltaY, deltaX) * 180) / Math.PI);

//     if (angle <= 45 || angle >= 135) {
//       const direction = deltaX > 0 ? "right" : "left";
//       setSwipeDirection(direction);
//       const progress = Math.min(Math.abs(deltaX) / (window.innerWidth / 2), 1);
//       setSwipeProgress(progress);
//     }
//   };

//   const handleMouseUp = () => {
//     if (
//       !isMouseDown.current ||
//       touchStartX.current === null ||
//       touchCurrentX.current === null ||
//       touchStartY.current === null ||
//       touchCurrentY.current === null
//     ) {
//       isMouseDown.current = false;
//       return;
//     }

//     const deltaX = touchCurrentX.current - touchStartX.current;
//     const deltaY = touchCurrentY.current - touchStartY.current;
//     const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

//     // If movement is small, it's a click - toggle play/pause
//     if (totalMovement < SWIPE_THRESHOLD) {
//       togglePlay({} as React.MouseEvent);
//     } else {
//       // It's a swipe - handle like/dislike
//       if (deltaX > SWIPE_THRESHOLD) {
//         handleLike();
//       } else if (deltaX < -SWIPE_THRESHOLD) {
//         handleDislike();
//       }
//     }

//     isMouseDown.current = false;
//     touchStartX.current = null;
//     touchStartY.current = null;
//     touchCurrentX.current = null;
//     touchCurrentY.current = null;
//     setSwipeDirection(null);
//     setSwipeProgress(0);
//   };

//   const handleMouseLeave = () => {
//     if (isMouseDown.current) {
//       isMouseDown.current = false;
//       touchStartX.current = null;
//       touchStartY.current = null;
//       touchCurrentX.current = null;
//       touchCurrentY.current = null;
//       setSwipeDirection(null);
//       setSwipeProgress(0);
//     }
//   };

//   const toggleMute = useCallback((e: React.MouseEvent) => {
//     e.stopPropagation();
//     setIsMuted((prev) => !prev);
//   }, []);

//   const togglePlay = useCallback((e: React.MouseEvent) => {
//     e.stopPropagation();
//     setIsPlaying((prev) => !prev);
//   }, []);

//   const handleDislike = useCallback(async () => {
//     if (searchVideoId) setSearchVideoId(null);
//     if (searchTokenAddress) setSearchTokenAddress(null);
//     await goToNext();
//   }, [
//     searchVideoId,
//     searchTokenAddress,
//     setSearchVideoId,
//     setSearchTokenAddress,
//     goToNext,
//   ]);

//   const handleLike = useCallback(async () => {
//     if (currentDisplayed) {
//       const tokenData = {
//         address: currentDisplayed.tokenAddress,
//         name: currentDisplayed.name,
//         symbol: currentDisplayed.symbol,
//         icon: currentDisplayed.image,
//         price: currentDisplayed.priceByUsd,
//         balance: "0",
//         balanceUSD: "0",
//         changeUSD: currentDisplayed.price24hChange,
//         changePercentage: (
//           (Number(currentDisplayed.price24hChange) /
//             Number(currentDisplayed.priceByUsd)) *
//           100
//         ).toString(),
//         solValue: currentDisplayed.priceByNative,
//         usdValue: currentDisplayed.priceByUsd,
//       };
//       showTokenBuyModal(tokenData, handleDislike);
//     }
//   }, [currentDisplayed, handleDislike]);

//   // Render swipe indicator
//   const renderSwipeIndicator = (
//     direction: "left" | "right",
//     label: string,
//     bgColor: string
//   ) =>
//     swipeDirection === direction &&
//     swipeProgress > 0.2 && (
//       <div
//         className={`absolute top-10 ${
//           direction === "right" ? "right-10" : "left-10"
//         } z-[70] ${bgColor} border-2 border-black px-6 py-2 shadow-[2px_3px_0px_0px_#000]`}
//         style={{
//           opacity: Math.min(swipeProgress * 2, 1),
//           transform: `rotate(${
//             swipeProgress * 15 * (direction === "right" ? 1 : -1)
//           }deg)`,
//         }}
//       >
//         <span className="text-2xl font-bold">{label}</span>
//       </div>
//     );

//   return (
//     <div className="relative h-[calc(100vh-72px-env(safe-area-inset-top,0)-var(--tg-viewport-content-safe-area-inset-top,0))] w-full overflow-hidden">
//       <div
//         className="relative h-full w-full"
//         onTouchStart={handleTouchStart}
//         onTouchMove={handleTouchMove}
//         onTouchEnd={handleTouchEnd}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onMouseLeave={handleMouseLeave}
//         style={{ touchAction: "pan-y" }}
//       >
//         {!currentTokenData ? (
//           isCurrentTokenLoading ? (
//             <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
//             </div>
//           ) : (
//             <EmptyTokenFeed onRefresh={refetchCurrentToken} />
//           )
//         ) : !isInitialized || carouselItems.length < 1 ? (
//           <div className="flex items-center justify-center h-full">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
//           </div>
//         ) : (
//           <div className="h-full w-full overflow-hidden relative">
//             <div
//               className="h-full w-full flex"
//               style={{
//                 width: `${carouselItems.length * 100}%`,
//                 transform: `translateX(${getTransformValue()})`,
//                 transition:
//                   isTransitioning || isVirtualSliding
//                     ? `transform ${SLIDE_SPEED_MS}ms ease`
//                     : "none",
//               }}
//               onTransitionEnd={() => {
//                 setIsTransitioning(false);
//                 // Note: Do not reset isVirtualSliding here as it's managed in goToNext
//               }}
//             >
//               {carouselItems.map((item, index) => (
//                 <div
//                   key={item.id ?? index}
//                   className="relative h-full w-full flex-shrink-0"
//                   style={{ width: `${100 / carouselItems.length}%` }}
//                 >
//                   {(Number(item.kingOfTheHillProgress) === 100 ||
//                     Number(item.listProgress) === 100) && (
//                     <div className="absolute inset-0 z-50 pointer-events-none">
//                       <div
//                         className={`h-full w-full rounded-lg ${
//                           Number(item.kingOfTheHillProgress) === 100
//                             ? "rainbow-border"
//                             : "completed-border"
//                         }`}
//                       />
//                     </div>
//                   )}

//                   <div className="absolute inset-0">
//                     <TokenCard
//                       token={{
//                         ...item,
//                         thumbnailUrl: item.image,
//                         preloadedVideoUrl: "",
//                       }}
//                       isMuted={isMuted}
//                       isPlaying={
//                         isPlaying && index === getCurrentActivePosition()
//                       }
//                     />
//                   </div>

//                   {index === getCurrentActivePosition() && (
//                     <>
//                       <div className="absolute inset-0 z-[1] cursor-pointer" />
//                       {renderSwipeIndicator("right", "YES", "bg-[#7DFCC7]")}
//                       {renderSwipeIndicator("left", "NO", "bg-error-light")}
//                       <ActionCard
//                         isMuted={isMuted}
//                         isPlaying={isPlaying}
//                         onMuteToggle={toggleMute}
//                         onPlayToggle={togglePlay}
//                         onLike={handleLike}
//                         onDislike={handleDislike}
//                         symbol={item.symbol}
//                         tokenAddress={item.tokenAddress}
//                         status={item.status}
//                         dexScreenerPairUrl={item.dexScreenerPairUrl}
//                       />
//                     </>
//                   )}

//                   {/* Preload videos */}
//                   {shouldPreloadVideos &&
//                     nextTokenDatas.filter(Boolean).map((t, i) => (
//                       <div
//                         key={i}
//                         className="absolute inset-0 opacity-0 pointer-events-none"
//                       >
//                         <VideoPlayer
//                           videoUrl={t?.videoInfo?.url || ""}
//                           thumbnailUrl={t?.image || ""}
//                           isMuted
//                           isPlaying
//                           loadStrategy="eager"
//                         />
//                       </div>
//                     ))}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//         {isCurrentTokenLoading && (
//           <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
