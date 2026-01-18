// import {
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   Stack,
//   Button,
//   Divider,
// } from "@mui/material";
// import StatusChip from "./StatusChip";
// import ImageStrip from "./ImageStrip";

// export default function SellRequestsTab({
//   sellRequests,
//   navigate,
//   setSelectedSell,
//   setOpenSellModal,
// }) {
//   if (sellRequests.length === 0) return null;

//   return (
//     <Grid container spacing={2}>
//       {sellRequests.map((r) => {
//         const created = r.createdAt || r.date;
//         const loc = r.location || {};
//         const address = r.display_name || r.displayName || r.address?.display_name;
//         const lat = loc.lat ?? loc.latitude;
//         const lng = loc.lng ?? loc.longitude;

//         return (
//           <Grid key={r._id || r.id} item xs={12} md={6}>
//             <Card
//               role="button"
//               onClick={() => {
//                 setSelectedSell(r);
//                 setOpenSellModal(true);
//               }}
//               sx={{
//                 cursor: "pointer",
//                 transition: "transform 0.12s ease, box-shadow 0.12s ease",
//                 "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
//               }}
//             >
//               <CardContent>
//                 <Stack direction="row" justifyContent="space-between">
//                   <Typography fontWeight={600}>
//                     {r.name || "Sell Request"}
//                   </Typography>
//                   <StatusChip value={r.status} />
//                 </Stack>

//                 <Typography variant="body2" sx={{ mt: 0.5 }}>
//                   {r.description || "No description provided."}
//                 </Typography>

//                 <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
//                   <Typography variant="body2" color="text.secondary">
//                     {created ? new Date(created).toLocaleString() : "—"}
//                   </Typography>
//                   <Divider orientation="vertical" flexItem />
//                   <Typography fontWeight={600}>
//                     ₱{Number(r.price || 0).toLocaleString()}
//                   </Typography>
//                 </Stack>

//                 {address && (
//                   <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//                     {address}
//                   </Typography>
//                 )}

//                 <ImageStrip images={r.images} />

//                 <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
//                   {lat != null && lng != null && (
//                     <Button
//                       size="small"
//                       variant="outlined"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         window.open(
//                           `https://www.google.com/maps?q=${lat},${lng}`,
//                           "_blank"
//                         );
//                       }}
//                     >
//                       Open Map
//                     </Button>
//                   )}
//                   <Button
//                     size="small"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       navigate("/sell", {
//                         state: { sellRequest: r },
//                       });
//                     }}
//                   >
//                     Resubmit
//                   </Button>
//                 </Stack>
//               </CardContent>
//             </Card>
//           </Grid>
//         );
//       })}
//     </Grid>
//   );
// }


import {
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Divider,
} from "@mui/material";
import StatusChip from "./StatusChip";
import ImageStrip from "./ImageStrip";

export default function SellRequestsTab({
  sellRequests,
  navigate,
  setSelectedSell,
  setOpenSellModal,
  actingId,
  handleRespondToPrice,
  handleCounterOffer,
}) {
  if (sellRequests.length === 0) return null;

  return (
    <Grid container spacing={2}>
      {sellRequests.map((r) => {
        const created = r.createdAt || r.date;
        const loc = r.location || {};
        const address =
          r.display_name || r.displayName || r.address?.display_name;
        const lat = loc.lat ?? loc.latitude;
        const lng = loc.lng ?? loc.longitude;

        const idKey = r._id || r.id;
        const hasProposal = typeof r?.proposedPrice === "number";
        const waiting = r.status === "awaiting_price_approval";
        const accepted = r.status === "price_accepted";

        const agreed = r.agreementPrice ?? r.price;

        return (
          <Grid key={idKey} item xs={12} md={6}>
            <Card
              role="button"
              onClick={() => {
                setSelectedSell(r);
                setOpenSellModal(true);
              }}
              sx={{
                cursor: "pointer",
                transition: "transform 0.12s ease, box-shadow 0.12s ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
              }}
            >
              <CardContent>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={600}>
                    {r.name || "Sell Request"}
                  </Typography>
                  <StatusChip value={r.status} />
                </Stack>

                {/* Description */}
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {r.description || "No description provided."}
                </Typography>

                {/* Date + Price */}
                <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {created ? new Date(created).toLocaleString() : "—"}
                  </Typography>
                  <Divider orientation="vertical" flexItem />
                  <Typography fontWeight={600}>
                    ₱{Number(r.price || 0).toLocaleString()}
                  </Typography>
                </Stack>

                {/* Proposed price */}
                {hasProposal && waiting && (
                  <Typography sx={{ mt: 1 }}>
                    Proposed Price: ₱
                    {Number(r.proposedPrice).toLocaleString()}
                  </Typography>
                )}

                {/* Accepted price */}
                {accepted && typeof agreed === "number" && (
                  <Typography sx={{ mt: 0.5 }}>
                    Agreed Price: ₱{Number(agreed).toLocaleString()}
                  </Typography>
                )}

                {/* PRICE ACTION BUTTONS (same as Demolish) */}
                {waiting && (
                  <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      disabled={actingId === idKey}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRespondToPrice(r, true);
                      }}
                    >
                      {actingId === idKey ? "Working..." : "Accept"}
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="info"
                      disabled={actingId === idKey}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCounterOffer(r);
                      }}
                    >
                      {actingId === idKey ? "Sending..." : "Counter"}
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="warning"
                      disabled={actingId === idKey}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRespondToPrice(r, false);
                      }}
                    >
                      Decline
                    </Button>
                  </Stack>
                )}

                {/* Address */}
                {address && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {address}
                  </Typography>
                )}

                {/* Images */}
                <ImageStrip images={r.images} />

                {/* Actions */}
                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                  {lat != null && lng != null && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          `https://www.google.com/maps?q=${lat},${lng}`,
                          "_blank"
                        );
                      }}
                    >
                      Open Map
                    </Button>
                  )}

                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/sell", {
                        state: { sellRequest: r },
                      });
                    }}
                  >
                    Resubmit
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
