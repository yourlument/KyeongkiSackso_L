                                                                          
                                                                        
                                                                          
UPDATE "notifications"
SET "link" = '/quotes/' || split_part("link", 'request=', 2)
WHERE "id" LIKE 'quote-request-published:%'
  AND "link" LIKE '/partner/quotes?tab=announcement&request=%';
