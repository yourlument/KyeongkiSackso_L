                                                                             
                                                                          
                                                                              
                                                                
UPDATE "nara_items"
SET "class_no" = '3011150501'
WHERE "nps_code" IN ('12203515', '12203516')
  AND ("class_no" IS NULL OR btrim("class_no") = '');

UPDATE "products"
SET "nps_code" = '3011150501'
WHERE "nps_code" IN ('12203515', '12203516');

UPDATE "quote_requests"
SET "nps_code" = '3011150501'
WHERE "nps_code" IN ('12203515', '12203516');
