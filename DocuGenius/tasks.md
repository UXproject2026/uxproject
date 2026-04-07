ScenePass is a new, redesigned version of the app.
It has a fresh lavender-themed look, a cleaner logo, and the wording across the site has been updated to match the new brand.
The app now connects to live event data by using the Spektrix v3 public API. It regularly sends HTTP requests to each venue’s Spektrix endpoint, such as /api/v3/events and /api/v3/events/{id}/instances, to pull real event and performance information. Because each venue in Leeds has its own Spektrix client URL, the app repeats this process for Grand Theatre, City Varieties, Hyde Park Picture House, Opera North, and Northern Ballet, then combines all the results into one listings page in ScenePass.

Booking is more flexible.
For reserved seating, users can pick seats from a live seating map based on the seat-status data returned by the API. For general admission events, where the API does not return a seating plan, the app automatically switches to a simple ticket-count system instead. The app also moves shows into an archive once the event date has passed.

Users can create accounts and save details.
There are sign in and sign up pages, plus a profile area that stores order history, receipts, and saved cards.

The app also includes accessibility features.
Users can turn on larger text, high contrast mode, and link highlighting. There is also a chat widget that gives quick support-style replies.

Behind the scenes, the app uses MongoDB and automatic syncing.
A background process updates the event listings every day, and user settings are saved in the browser so the demo stays lightweight.

Possible future improvements include:

Secure login with hashed passwords and JWT.

Real payments using Stripe or PayPal.

Email receipts with PDFs and QR codes.

More venue partnerships for fuller coverage.

Show recommendations based on what users have booked before.

Calendar syncing with Google Calendar, iCal, or Outlook.
