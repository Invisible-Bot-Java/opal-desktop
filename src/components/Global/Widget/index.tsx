import { ClerkLoading, SignedIn, useUser } from "@clerk/clerk-react";
import React from "react";
import MediaConfiguration from "../MediaConfiguration";
import { Loader } from "../Loader";
import { fetchUserProfile } from "@/lib/utils";
import { useMediaSources } from "@/hooks/useMediaSources";

const Widget = () => {
  const [profile, setProfile] = React.useState<{
    status: number;
    user:
      | ({
          subscription: {
            plan: "PRO" | "FREE";
          } | null;
          studio: {
            id: string;
            screen: string | null;
            mic: string | null;
            preset: "HD" | "SD";
            camera: string | null;
            userId: string | null;
          } | null;
        } & {
          id: string;
          email: string;
          firstname: string | null;
          lastname: string | null;
          createdAt: Date;
          clerkid: string;
        })
      | null;
  } | null>(null);
  const { user } = useUser();
  const { state, fetchMediaResources } = useMediaSources();

  React.useEffect(() => {
    if (user && user.id) {
      fetchUserProfile(user.id).then((data) => {
        setProfile(data);
      });
      fetchMediaResources();
    }
  }, [user]);
  return (
    <div className="p-5">
      <ClerkLoading>
        <div className="h-full flex justify-center items-center">
          <Loader />
        </div>
      </ClerkLoading>
      <SignedIn>
        {profile ? (
          <MediaConfiguration user={profile?.user} state={state} />
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <Loader color="#fff" />
          </div>
        )}
      </SignedIn>
    </div>
  );
};

export default Widget;
