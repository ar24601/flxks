# Backlog

- [ ] Ensure when we move to production and supabase online that we are using RLS (Row Level Security) and make any changes that that requires.
- [ ] Document the new free version feature restrictions (limit of 2 slides, 2 expands, 2 search find-nexts, and disabled isolation mode, disabled 'b' key, disabled 'CMD+F' find mode, and disabled new windows) in the official user documentation.
- [ ] Implement IP Allowlisting for the `webhook-paddle` edge function (production only) to ensure it only accepts traffic from official Paddle IP addresses. Skip this check during local testing/development.
