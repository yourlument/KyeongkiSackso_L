                                                                          
                                                                                
                                                                                 
                                                                              
                                           
UPDATE "products" AS product
SET "nps_code" = item."class_no"
FROM "nara_items" AS item
WHERE product."nps_code" = item."nps_code"
  AND item."class_no" IS NOT NULL
  AND item."class_no" <> '';

UPDATE "quote_requests" AS request
SET "nps_code" = item."class_no"
FROM "nara_items" AS item
WHERE request."nps_code" = item."nps_code"
  AND item."class_no" IS NOT NULL
  AND item."class_no" <> '';
